
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

    const { organization_id, workspace_id } = await req.json()

    if (!organization_id) {
      throw new Error('Organization ID is required')
    }

    console.log('📊 Context data request for organization:', organization_id, 'workspace:', workspace_id)

    // Build base queries with organization filter
    let clientsQuery = supabaseClient
      .from('clients')
      .select('id, name, email, phone, contact_number, type, is_active, payment_terms, default_discount')
      .eq('organization_id', organization_id)
      .eq('is_active', true)

    let invoicesQuery = supabaseClient
      .from('invoices')
      .select('id, invoice_number, client_name, status, total_amount, due_date, created_at')
      .eq('organization_id', organization_id)
      .in('status', ['draft', 'sent', 'partially_paid'])

    let quotesQuery = supabaseClient
      .from('quotes')
      .select('id, quote_number, client_name, status, total_amount, valid_until, created_at')
      .eq('organization_id', organization_id)
      .in('status', ['draft', 'sent'])

    let dossiersQuery = supabaseClient
      .from('dossiers')
      .select('id, name, description, status, category, client_id, created_at')
      .eq('organization_id', organization_id)
      .eq('status', 'active')

    let tasksQuery = supabaseClient
      .from('pending_tasks')
      .select('id, title, description, status, priority, due_date, assigned_to, client_id, dossier_id')
      .eq('organization_id', organization_id)
      .eq('status', 'open')

    let emailsQuery = supabaseClient
      .from('emails')
      .select('id, subject, from_email, to_email, status, priority, created_at, client_id, dossier_id')
      .eq('organization_id', organization_id)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days

    let phoneCallsQuery = supabaseClient
      .from('phone_calls')
      .select('id, contact_name, phone_number, call_type, status, duration, notes, created_at, client_id, dossier_id')
      .eq('organization_id', organization_id)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days

    // Add workspace filter if provided
    if (workspace_id) {
      clientsQuery = clientsQuery.eq('workspace_id', workspace_id)
      invoicesQuery = invoicesQuery.eq('workspace_id', workspace_id)
      quotesQuery = quotesQuery.eq('workspace_id', workspace_id)
      dossiersQuery = dossiersQuery.eq('workspace_id', workspace_id)
      tasksQuery = tasksQuery.eq('workspace_id', workspace_id)
      emailsQuery = emailsQuery.eq('workspace_id', workspace_id)
      phoneCallsQuery = phoneCallsQuery.eq('workspace_id', workspace_id)
    }

    // Execute all queries in parallel
    const [
      clientsResult,
      invoicesResult,
      quotesResult,
      dossiersResult,
      tasksResult,
      emailsResult,
      phoneCallsResult,
      organizationSettingsResult
    ] = await Promise.all([
      clientsQuery.order('created_at', { ascending: false }).limit(50),
      invoicesQuery.order('created_at', { ascending: false }).limit(100),
      quotesQuery.order('created_at', { ascending: false }).limit(50),
      dossiersQuery.order('created_at', { ascending: false }).limit(30),
      tasksQuery.order('due_date', { ascending: true }).limit(50),
      emailsQuery.order('created_at', { ascending: false }).limit(50),
      phoneCallsQuery.order('created_at', { ascending: false }).limit(30),
      supabaseClient
        .from('organization_settings')
        .select('company_name, company_email, company_phone, default_payment_terms, default_vat_rate')
        .eq('organization_id', organization_id)
        .single()
    ])

    // Check for errors
    const results = [clientsResult, invoicesResult, quotesResult, dossiersResult, tasksResult, emailsResult, phoneCallsResult]
    for (const result of results) {
      if (result.error) {
        console.error('Database query error:', result.error)
        throw result.error
      }
    }

    // Calculate metrics and summaries
    const clients = clientsResult.data || []
    const invoices = invoicesResult.data || []
    const quotes = quotesResult.data || []
    const dossiers = dossiersResult.data || []
    const tasks = tasksResult.data || []
    const emails = emailsResult.data || []
    const phoneCalls = phoneCallsResult.data || []
    const orgSettings = organizationSettingsResult.data

    // Calculate important metrics
    const metrics = {
      total_active_clients: clients.length,
      total_outstanding_invoices: invoices.filter(inv => inv.status !== 'draft').length,
      total_outstanding_amount: invoices.reduce((sum, inv) => sum + (parseFloat(inv.total_amount) || 0), 0),
      overdue_invoices: invoices.filter(inv => inv.due_date && new Date(inv.due_date) < new Date()).length,
      pending_quotes: quotes.length,
      active_dossiers: dossiers.length,
      open_tasks: tasks.length,
      high_priority_tasks: tasks.filter(task => task.priority === 'high').length,
      unread_emails: emails.filter(email => email.status === 'unread').length,
      recent_activities: emails.length + phoneCalls.length
    }

    // Structure context data for AI consumption
    const contextData = {
      organization: {
        settings: orgSettings,
        metrics: metrics
      },
      clients: {
        active_clients: clients.map(client => ({
          id: client.id,
          name: client.name,
          contact_number: client.contact_number,
          email: client.email,
          type: client.type,
          payment_terms: client.payment_terms,
          default_discount: client.default_discount
        })),
        summary: `${clients.length} actieve klanten, waarvan ${clients.filter(c => c.type === 'zakelijk').length} zakelijk en ${clients.filter(c => c.type === 'prive').length} privé`
      },
      financial: {
        invoices: {
          outstanding: invoices.filter(inv => inv.status !== 'draft').map(inv => ({
            number: inv.invoice_number,
            client: inv.client_name,
            status: inv.status,
            amount: inv.total_amount,
            due_date: inv.due_date,
            days_overdue: inv.due_date ? Math.max(0, Math.floor((new Date().getTime() - new Date(inv.due_date).getTime()) / (1000 * 60 * 60 * 24))) : 0
          })),
          drafts: invoices.filter(inv => inv.status === 'draft').length
        },
        quotes: {
          active: quotes.map(quote => ({
            number: quote.quote_number,
            client: quote.client_name,
            status: quote.status,
            amount: quote.total_amount,
            valid_until: quote.valid_until,
            days_until_expiry: quote.valid_until ? Math.floor((new Date(quote.valid_until).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null
          }))
        },
        summary: `€${metrics.total_outstanding_amount.toFixed(2)} uitstaand in ${metrics.total_outstanding_invoices} facturen, ${metrics.overdue_invoices} facturen overschreden`
      },
      projects: {
        dossiers: dossiers.map(dossier => ({
          id: dossier.id,
          name: dossier.name,
          description: dossier.description,
          category: dossier.category,
          client_id: dossier.client_id,
          created_at: dossier.created_at
        })),
        summary: `${dossiers.length} actieve dossiers`
      },
      tasks: {
        open_tasks: tasks.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          due_date: task.due_date,
          client_id: task.client_id,
          dossier_id: task.dossier_id,
          days_until_due: task.due_date ? Math.floor((new Date(task.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null
        })),
        summary: `${tasks.length} openstaande taken, waarvan ${metrics.high_priority_tasks} met hoge prioriteit`
      },
      communication: {
        recent_emails: emails.map(email => ({
          id: email.id,
          subject: email.subject,
          from: email.from_email,
          to: email.to_email,
          status: email.status,
          priority: email.priority,
          created_at: email.created_at,
          client_id: email.client_id,
          dossier_id: email.dossier_id
        })),
        recent_calls: phoneCalls.map(call => ({
          id: call.id,
          contact_name: call.contact_name,
          phone_number: call.phone_number,
          call_type: call.call_type,
          duration: call.duration,
          notes: call.notes,
          created_at: call.created_at,
          client_id: call.client_id,
          dossier_id: call.dossier_id
        })),
        summary: `${emails.length} recente emails (${metrics.unread_emails} ongelezen), ${phoneCalls.length} recente telefoongesprekken`
      },
      timestamp: new Date().toISOString(),
      data_scope: workspace_id ? `workspace-${workspace_id}` : `organization-${organization_id}`
    }

    console.log('✅ Context data compiled successfully:', {
      clients: clients.length,
      invoices: invoices.length,
      quotes: quotes.length,
      dossiers: dossiers.length,
      tasks: tasks.length,
      emails: emails.length,
      calls: phoneCalls.length
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        context: contextData 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('❌ Context data error:', error)
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
