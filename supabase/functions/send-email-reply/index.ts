
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
    console.log('📧 Starting email reply function');
    
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
          error: 'Email service is not configured. Please configure RESEND_API_KEY in your Supabase secrets.' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        },
      )
    }

    const resend = new Resend(resendApiKey)

    const requestBody: EmailReplyRequest = await req.json()
    const {
      task_id,
      to_email,
      subject,
      content,
      organization_id,
      workspace_id,
      original_email_id,
      thread_id
    } = requestBody

    console.log('📤 Email request details:', {
      task_id,
      to_email,
      subject_preview: subject.substring(0, 50),
      content_length: content.length,
      organization_id,
      workspace_id
    });

    // Validate required fields
    if (!to_email || !subject || !content || !task_id || !organization_id) {
      const missingFields = [];
      if (!to_email) missingFields.push('to_email');
      if (!subject) missingFields.push('subject');
      if (!content) missingFields.push('content');
      if (!task_id) missingFields.push('task_id');
      if (!organization_id) missingFields.push('organization_id');
      
      console.error('❌ Missing required fields:', missingFields);
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Fetch organization settings for sender information
    console.log('🏢 Fetching organization settings for:', organization_id);
    
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

    console.log('📤 Email will be sent from:', `${fromName} <${fromEmail}>`)
    console.log('📤 Email will be sent to:', to_email)
    console.log('📋 Subject:', subject)

    // Convert plain text to HTML if needed
    const htmlContent = content.includes('<') ? content : content.replace(/\n/g, '<br>')

    // Send email via Resend
    console.log('📮 Sending email via Resend...')
    
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

    console.log('📧 Resend response:', emailResponse);

    if (emailResponse.error) {
      console.error('❌ Resend API error:', emailResponse.error)
      
      // Check for specific domain verification error
      if (emailResponse.error.message && emailResponse.error.message.includes('domain is not verified')) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `The ${fromEmail.split('@')[1]} domain is not verified. Please add and verify your domain at https://resend.com/domains`
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 403,
          },
        )
      }
      
      throw new Error(`Email send failed: ${emailResponse.error.message || 'Unknown Resend error'}`)
    }

    console.log('✅ Email sent successfully with ID:', emailResponse.data?.id)

    // Log the email send
    const sendLogRecord = {
      organization_id,
      workspace_id: workspace_id || null,
      original_email_id: original_email_id || null,
      task_id,
      to_email,
      from_email: fromEmail,
      subject,
      content,
      status: 'sent',
      message_id: emailResponse.data?.id || null,
      sent_at: new Date().toISOString()
    }

    console.log('📝 Logging email send...')
    
    const { error: logError } = await supabaseClient
      .from('email_send_logs')
      .insert(sendLogRecord)

    if (logError) {
      console.error('⚠️ Could not log email send:', logError)
      // Don't fail the whole operation for logging errors
    } else {
      console.log('✅ Email send logged successfully')
    }

    // Update the task status to completed
    console.log('🔄 Updating task status to completed...')
    
    const { error: taskUpdateError } = await supabaseClient
      .from('pending_tasks')
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', task_id)
      .eq('organization_id', organization_id) // Extra security check

    if (taskUpdateError) {
      console.error('❌ Error updating task status:', taskUpdateError)
      // Don't fail for task update errors, email was sent successfully
      console.log('⚠️ Email was sent but task status could not be updated')
    } else {
      console.log('✅ Task status updated to completed')
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

  } catch (error: any) {
    console.error('❌ Complete send email process failed:', error)
    
    let errorMessage = 'Unknown error occurred'
    let statusCode = 500
    
    if (error.message) {
      errorMessage = error.message
      
      // Set specific status codes for known error types
      if (error.message.includes('domain is not verified')) {
        statusCode = 403
      } else if (error.message.includes('Missing required fields')) {
        statusCode = 400
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: statusCode,
      },
    )
  }
})
