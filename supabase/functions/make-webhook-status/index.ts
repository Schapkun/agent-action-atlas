
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action_id, status, webhook_url, execution_data } = await req.json()

    console.log('📡 Status update versturen naar Make.com:', { action_id, status, webhook_url })

    if (!webhook_url) {
      throw new Error('Geen webhook URL beschikbaar voor deze actie')
    }

    // Status update naar Make.com
    const makeResponse = await fetch(webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action_id,
        status,
        timestamp: new Date().toISOString(),
        execution_data
      })
    })

    if (!makeResponse.ok) {
      throw new Error(`Make.com webhook failed: ${makeResponse.status}`)
    }

    console.log('✅ Status update succesvol verzonden naar Make.com')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Status update verzonden naar Make.com' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('❌ Status webhook fout:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
