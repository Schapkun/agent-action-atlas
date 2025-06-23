
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'npm:resend@2.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailReplyRequest {
  task_id: string
  to_email: string
  subject: string
  content: string
  organization_id: string
  workspace_id?: string
  original_email_id?: string
  thread_id?: string
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

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY is not configured')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Email service is not configured. Please configure RESEND_API_KEY.' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        },
      )
    }

    const resend = new Resend(resendApiKey)

    const {
      task_id,
      to_email,
      subject,
      content,
      organization_id,
      workspace_id,
      original_email_id,
      thread_id
    }: EmailReplyRequest = await req.json()

    console.log('📤 Sending email reply for task:', task_id)
    console.log('📧 To:', to_email)
    console.log('📋 Subject:', subject)

    if (!to_email || !subject || !content) {
      throw new Error('Missing required email fields: to_email, subject, or content')
    }

    // Haal organisatie settings op voor afzender informatie
    const { data: orgSettings, error: orgError } = await supabaseClient
      .from('organization_settings')
      .select('company_email, company_name')
      .eq('organization_id', organization_id)
      .maybeSingle()

    if (orgError) {
      console.error('⚠️ Could not fetch organization settings:', orgError)
    }

    const fromEmail = orgSettings?.company_email || 'noreply@example.com'
    const fromName = orgSettings?.company_name || 'Support Team'

    console.log('📤 Sending from:', `${fromName} <${fromEmail}>`)

    // Converteer plain text naar HTML als nodig
    const htmlContent = content.includes('<') ? content : content.replace(/\n/g, '<br>')

    // Verstuur e-mail via Resend
    const emailResponse = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [to_email],
      subject: subject,
      html: htmlContent,
      headers: thread_id ? {
        'In-Reply-To': thread_id,
        'References': thread_id
      } : undefined
    })

    if (emailResponse.error) {
      console.error('❌ Resend API error:', emailResponse.error)
      throw new Error(`Email send failed: ${emailResponse.error.message}`)
    }

    console.log('✅ Email sent successfully:', emailResponse.data?.id)

    // Log de verzending
    const sendLogRecord = {
      organization_id,
      workspace_id,
      original_email_id,
      task_id,
      to_email,
      from_email: fromEmail,
      subject,
      content,
      status: 'sent',
      message_id: emailResponse.data?.id,
      sent_at: new Date().toISOString()
    }

    const { error: logError } = await supabaseClient
      .from('email_send_logs')
      .insert(sendLogRecord)

    if (logError) {
      console.error('⚠️ Could not log email send:', logError)
    }

    // Update de task status naar completed
    const { error: taskUpdateError } = await supabaseClient
      .from('pending_tasks')
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', task_id)

    if (taskUpdateError) {
      console.error('❌ Error updating task status:', taskUpdateError)
      throw new Error(`Could not update task status: ${taskUpdateError.message}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message_id: emailResponse.data?.id,
        message: 'Email reply sent successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('❌ Send email error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
