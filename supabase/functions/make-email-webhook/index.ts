
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const emailData = await req.json()
    
    console.log('📧 Incoming email webhook data:', JSON.stringify(emailData, null, 2))

    // Valideer verplichte velden
    if (!emailData.organization_id) {
      throw new Error('organization_id is required')
    }

    // Bereid email data voor opslag voor
    const emailRecord = {
      organization_id: emailData.organization_id,
      workspace_id: emailData.workspace_id || null,
      subject: emailData.subject || 'No Subject',
      from_email: emailData.from || emailData.sender || 'unknown@unknown.com',
      to_email: emailData.to || emailData.recipient || '',
      content: emailData.content || emailData.body_text || '',
      body_html: emailData.body_html || emailData.html || null,
      body_text: emailData.body_text || emailData.text || emailData.content || '',
      message_id: emailData.message_id || emailData.messageId || null,
      in_reply_to: emailData.in_reply_to || emailData.inReplyTo || null,
      email_references: emailData.references || emailData.refs || null,
      thread_id: emailData.thread_id || emailData.threadId || emailData.message_id || null,
      folder: emailData.folder || 'inbox',
      priority: emailData.priority || 'medium',
      status: emailData.status || 'unread',
      is_read: emailData.is_read || false,
      is_flagged: emailData.is_flagged || false,
      has_attachments: emailData.has_attachments || (emailData.attachments && emailData.attachments.length > 0) || false,
      attachments: emailData.attachments || [],
      headers: emailData.headers || {},
      received_at: emailData.received_at || emailData.date || new Date().toISOString(),
      make_scenario_id: emailData.make_scenario_id || emailData.scenario_id || null,
      raw_email_data: emailData,
      client_id: emailData.client_id || null,
      dossier_id: emailData.dossier_id || null,
      created_by: null // Webhook emails don't have a user
    }

    // Sla email op in database
    const { data: savedEmail, error: saveError } = await supabaseClient
      .from('emails')
      .insert(emailRecord)
      .select()
      .single()

    if (saveError) {
      console.error('❌ Error saving email:', saveError)
      throw saveError
    }

    console.log('✅ Email successfully saved:', savedEmail.id)

    // Probeer client te koppelen op basis van email adres
    if (emailRecord.from_email && emailRecord.organization_id) {
      const { data: matchingClient } = await supabaseClient
        .from('clients')
        .select('id, name')
        .eq('organization_id', emailRecord.organization_id)
        .eq('email', emailRecord.from_email)
        .maybeSingle()

      if (matchingClient) {
        await supabaseClient
          .from('emails')
          .update({ client_id: matchingClient.id })
          .eq('id', savedEmail.id)
        
        console.log('🔗 Email gekoppeld aan client:', matchingClient.name)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        email_id: savedEmail.id,
        message: 'Email successfully received and stored'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('❌ Email webhook error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
