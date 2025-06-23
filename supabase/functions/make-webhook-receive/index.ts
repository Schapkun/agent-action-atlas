
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

    const { 
      title, 
      description, 
      category, 
      client_name, 
      dossier_name, 
      organization_id, 
      workspace_id, 
      make_scenario_id, 
      webhook_url, 
      action_data 
    } = await req.json()

    console.log('🔄 Nieuwe AI actie ontvangen van Make.com:', { title, category, organization_id })

    const { data, error } = await supabaseClient
      .from('ai_actions')
      .insert({
        title,
        description,
        category,
        client_name,
        dossier_name,
        organization_id,
        workspace_id,
        make_scenario_id,
        webhook_url,
        action_data,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Fout bij aanmaken AI actie:', error)
      throw error
    }

    console.log('✅ AI actie succesvol aangemaakt:', data.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        action_id: data.id,
        message: 'AI actie succesvol ontvangen en opgeslagen'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('❌ Webhook fout:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
