
import "https://deno.land/x/xhr@0.1.0/mod.ts";
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

    // Verbeterde email data extractie - meer flexibele velden ondersteuning
    const fromEmail = emailData.from_email || 
                     emailData.from || 
                     emailData.sender || 
                     emailData.sender_email ||
                     (emailData.headers && emailData.headers.from) ||
                     'unknown@unknown.com';

    const toEmail = emailData.to_email || 
                   emailData.to || 
                   emailData.recipient || 
                   emailData.recipient_email ||
                   (emailData.headers && emailData.headers.to) ||
                   '';

    const subject = emailData.subject || 
                   emailData.email_subject ||
                   (emailData.headers && emailData.headers.subject) ||
                   'No Subject';

    const content = emailData.content || 
                   emailData.body_text || 
                   emailData.text ||
                   emailData.body ||
                   emailData.message ||
                   '';

    const bodyHtml = emailData.body_html || 
                    emailData.html || 
                    emailData.html_body ||
                    null;

    console.log('📧 Extracted email data:', {
      from: fromEmail,
      to: toEmail,
      subject: subject,
      content: content ? content.substring(0, 100) + '...' : 'No content'
    });

    // Bereid email data voor opslag voor
    const emailRecord = {
      organization_id: emailData.organization_id,
      workspace_id: emailData.workspace_id || null,
      subject: subject,
      from_email: fromEmail,
      to_email: toEmail,
      content: content,
      body_html: bodyHtml,
      body_text: content,
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
    if (fromEmail && fromEmail !== 'unknown@unknown.com' && emailRecord.organization_id) {
      const { data: matchingClient } = await supabaseClient
        .from('clients')
        .select('id, name')
        .eq('organization_id', emailRecord.organization_id)
        .eq('email', fromEmail)
        .maybeSingle()

      if (matchingClient) {
        await supabaseClient
          .from('emails')
          .update({ client_id: matchingClient.id })
          .eq('id', savedEmail.id)
        
        console.log('🔗 Email gekoppeld aan client:', matchingClient.name)
      }
    }

    // Genereer AI concept antwoord alleen als we geldige content hebben
    if (content && content.trim().length > 0) {
      console.log('🤖 Generating AI draft response...')
      try {
        const aiResponse = await generateAIDraftResponse({
          ...emailRecord,
          from_email: fromEmail,
          subject: subject,
          content: content
        })
        
        // Maak een pending task aan met AI concept
        const taskRecord = {
          organization_id: emailRecord.organization_id,
          workspace_id: emailRecord.workspace_id,
          title: `Antwoord op: ${subject}`,
          description: `AI concept antwoord gegenereerd voor e-mail van ${fromEmail}`,
          priority: emailRecord.priority,
          status: 'open',
          task_type: 'email_reply',
          email_id: savedEmail.id,
          ai_draft_content: aiResponse.content,
          ai_draft_subject: aiResponse.subject,
          email_thread_id: emailRecord.thread_id,
          reply_to_email: fromEmail,
          ai_generated: true,
          client_id: savedEmail.client_id,
          dossier_id: savedEmail.dossier_id
        }

        const { data: savedTask, error: taskError } = await supabaseClient
          .from('pending_tasks')
          .insert(taskRecord)
          .select()
          .single()

        if (taskError) {
          console.error('❌ Error creating pending task:', taskError)
        } else {
          console.log('✅ AI draft task created:', savedTask.id)
        }

      } catch (aiError) {
        console.error('❌ AI generation error:', aiError)
        // Continue without AI draft - email is still saved
      }
    } else {
      console.log('⚠️ No content found for AI draft generation')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        email_id: savedEmail.id,
        message: 'Email successfully received and processed',
        extracted_data: {
          from: fromEmail,
          to: toEmail,
          subject: subject,
          has_content: !!content
        }
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

async function generateAIDraftResponse(emailData: any) {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured')
  }

  const prompt = `
Je bent een professionele assistent die e-mail antwoorden genereert. 

INKOMENDE E-MAIL:
Van: ${emailData.from_email}
Onderwerp: ${emailData.subject}
Inhoud: ${emailData.content}

Genereer een professioneel, vriendelijk antwoord in het Nederlands. Het antwoord moet:
- Beleefd en professioneel zijn
- Relevant zijn voor de inhoud van de originele e-mail
- Duidelijk en beknopt zijn
- Gepaste afsluiting hebben

Geef het antwoord in het volgende JSON formaat:
{
  "subject": "Re: [onderwerp]",
  "content": "[e-mail inhoud met gepaste begroeting en afsluiting]"
}
`

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Je bent een professionele e-mail assistent die Nederlandse zakelijke e-mails schrijft.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`)
  }

  const data = await response.json()
  const aiContent = data.choices[0].message.content

  try {
    return JSON.parse(aiContent)
  } catch (parseError) {
    // Fallback als JSON parsing faalt
    return {
      subject: `Re: ${emailData.subject}`,
      content: aiContent
    }
  }
}
