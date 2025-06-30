
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
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const whatsappData = await req.json()
    
    console.log('📱 Nieuwe WhatsApp webhook ontvangen:', JSON.stringify(whatsappData, null, 2))

    // Extraheer relevante gegevens uit de WhatsApp webhook
    const {
      from,
      to,
      body,
      timestamp,
      messageId,
      profileName,
      ...otherData
    } = whatsappData

    // Sla het WhatsApp bericht op in de database
    const { data: webhookRecord, error: insertError } = await supabaseClient
      .from('whatsapp_messages')
      .insert({
        message_id: messageId || `wa_${Date.now()}`,
        from_number: from,
        to_number: to,
        message_body: body || '',
        profile_name: profileName || '',
        timestamp: timestamp ? new Date(timestamp * 1000).toISOString() : new Date().toISOString(),
        raw_webhook_data: whatsappData,
        status: 'received'
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ Fout bij opslaan WhatsApp bericht:', insertError)
      throw insertError
    }

    console.log('✅ WhatsApp bericht succesvol opgeslagen:', webhookRecord.id)

    // Stuur notificatie naar je toe (bijvoorbeeld via email of een andere webhook)
    try {
      // Hier kun je een notificatie versturen naar jezelf
      // Bijvoorbeeld via een Make.com webhook of email service
      const notificationWebhook = Deno.env.get('NOTIFICATION_WEBHOOK_URL')
      
      if (notificationWebhook) {
        await fetch(notificationWebhook, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'whatsapp_message_received',
            from: from,
            profileName: profileName,
            message: body,
            timestamp: new Date().toISOString(),
            messageId: webhookRecord.id
          })
        })
        console.log('📧 Notificatie verzonden naar webhook')
      }
    } catch (notificationError) {
      console.error('⚠️ Fout bij versturen notificatie:', notificationError)
      // Continue execution even if notification fails
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: webhookRecord.id,
        message: 'WhatsApp bericht succesvol ontvangen en opgeslagen'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('❌ WhatsApp webhook fout:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        message: 'Fout bij verwerken WhatsApp webhook'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
