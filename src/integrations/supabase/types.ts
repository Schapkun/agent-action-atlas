export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_actions: {
        Row: {
          category: string
          client_name: string | null
          created_at: string
          created_by: string | null
          description: string | null
          document_id: string | null
          dossier_name: string | null
          id: string
          organization_id: string
          status: string
          title: string
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          category: string
          client_name?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          document_id?: string | null
          dossier_name?: string | null
          id?: string
          organization_id: string
          status?: string
          title: string
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          category?: string
          client_name?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          document_id?: string | null
          dossier_name?: string | null
          id?: string
          organization_id?: string
          status?: string
          title?: string
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          billing_address: string | null
          city: string | null
          contact_number: string | null
          contact_person: string | null
          country: string | null
          created_at: string
          created_by: string | null
          default_discount: number | null
          discount_type: string | null
          email: string | null
          hide_notes_on_invoice: boolean | null
          iban: string | null
          id: string
          invoice_reference: string | null
          is_active: boolean | null
          mobile: string | null
          name: string
          notes: string | null
          organization_id: string
          payment_method: string | null
          payment_terms: number | null
          phone: string | null
          postal_code: string | null
          products_display: string | null
          reminder_email: string | null
          shipping_address: string | null
          shipping_instructions: string | null
          shipping_method: string | null
          updated_at: string
          vat_number: string | null
          website: string | null
          workspace_id: string | null
        }
        Insert: {
          address?: string | null
          billing_address?: string | null
          city?: string | null
          contact_number?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          default_discount?: number | null
          discount_type?: string | null
          email?: string | null
          hide_notes_on_invoice?: boolean | null
          iban?: string | null
          id?: string
          invoice_reference?: string | null
          is_active?: boolean | null
          mobile?: string | null
          name: string
          notes?: string | null
          organization_id: string
          payment_method?: string | null
          payment_terms?: number | null
          phone?: string | null
          postal_code?: string | null
          products_display?: string | null
          reminder_email?: string | null
          shipping_address?: string | null
          shipping_instructions?: string | null
          shipping_method?: string | null
          updated_at?: string
          vat_number?: string | null
          website?: string | null
          workspace_id?: string | null
        }
        Update: {
          address?: string | null
          billing_address?: string | null
          city?: string | null
          contact_number?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          default_discount?: number | null
          discount_type?: string | null
          email?: string | null
          hide_notes_on_invoice?: boolean | null
          iban?: string | null
          id?: string
          invoice_reference?: string | null
          is_active?: boolean | null
          mobile?: string | null
          name?: string
          notes?: string | null
          organization_id?: string
          payment_method?: string | null
          payment_terms?: number | null
          phone?: string | null
          postal_code?: string | null
          products_display?: string | null
          reminder_email?: string | null
          shipping_address?: string | null
          shipping_instructions?: string | null
          shipping_method?: string | null
          updated_at?: string
          vat_number?: string | null
          website?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_label_assignments: {
        Row: {
          contact_id: string
          created_at: string | null
          id: string
          label_id: string
        }
        Insert: {
          contact_id: string
          created_at?: string | null
          id?: string
          label_id: string
        }
        Update: {
          contact_id?: string
          created_at?: string | null
          id?: string
          label_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_label_assignments_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_label_assignments_label_id_fkey"
            columns: ["label_id"]
            isOneToOne: false
            referencedRelation: "contact_labels"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_labels: {
        Row: {
          color: string
          created_at: string | null
          id: string
          name: string
          organization_id: string
          updated_at: string | null
          workspace_id: string | null
        }
        Insert: {
          color?: string
          created_at?: string | null
          id?: string
          name: string
          organization_id: string
          updated_at?: string | null
          workspace_id?: string | null
        }
        Update: {
          color?: string
          created_at?: string | null
          id?: string
          name?: string
          organization_id?: string
          updated_at?: string | null
          workspace_id?: string | null
        }
        Relationships: []
      }
      document_template_label_assignments: {
        Row: {
          created_at: string | null
          id: string
          label_id: string
          template_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          label_id: string
          template_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          label_id?: string
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_template_label_assignments_label"
            columns: ["label_id"]
            isOneToOne: false
            referencedRelation: "document_template_labels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_template_label_assignments_template"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "document_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      document_template_labels: {
        Row: {
          color: string
          created_at: string | null
          id: string
          name: string
          organization_id: string
          updated_at: string | null
          workspace_id: string | null
        }
        Insert: {
          color?: string
          created_at?: string | null
          id?: string
          name: string
          organization_id: string
          updated_at?: string | null
          workspace_id?: string | null
        }
        Update: {
          color?: string
          created_at?: string | null
          id?: string
          name?: string
          organization_id?: string
          updated_at?: string | null
          workspace_id?: string | null
        }
        Relationships: []
      }
      document_templates: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          html_content: string
          id: string
          is_active: boolean
          is_default: boolean
          name: string
          organization_id: string | null
          placeholder_values: Json | null
          type: string
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          html_content: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          name: string
          organization_id?: string | null
          placeholder_values?: Json | null
          type: string
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          html_content?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          name?: string
          organization_id?: string | null
          placeholder_values?: Json | null
          type?: string
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_templates_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      dossiers: {
        Row: {
          category: string | null
          client_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          organization_id: string
          status: string
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          category?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          organization_id: string
          status?: string
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          category?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          status?: string
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dossiers_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      emails: {
        Row: {
          client_id: string | null
          content: string | null
          created_at: string
          created_by: string | null
          dossier_id: string | null
          from_email: string | null
          has_attachments: boolean | null
          id: string
          organization_id: string
          priority: string
          status: string
          subject: string
          to_email: string | null
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          client_id?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          dossier_id?: string | null
          from_email?: string | null
          has_attachments?: boolean | null
          id?: string
          organization_id: string
          priority?: string
          status?: string
          subject: string
          to_email?: string | null
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          client_id?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          dossier_id?: string | null
          from_email?: string | null
          has_attachments?: boolean | null
          id?: string
          organization_id?: string
          priority?: string
          status?: string
          subject?: string
          to_email?: string | null
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emails_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emails_dossier_id_fkey"
            columns: ["dossier_id"]
            isOneToOne: false
            referencedRelation: "dossiers"
            referencedColumns: ["id"]
          },
        ]
      }
      history_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          organization_id: string | null
          user_id: string | null
          workspace_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          organization_id?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          organization_id?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "history_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "history_logs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_lines: {
        Row: {
          created_at: string
          description: string
          id: string
          invoice_id: string
          line_total: number
          quantity: number
          sort_order: number | null
          unit_price: number
          vat_rate: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          line_total: number
          quantity?: number
          sort_order?: number | null
          unit_price: number
          vat_rate?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          line_total?: number
          quantity?: number
          sort_order?: number | null
          unit_price?: number
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_lines_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_address: string | null
          client_city: string | null
          client_country: string | null
          client_email: string | null
          client_name: string
          client_postal_code: string | null
          created_at: string
          created_by: string | null
          due_date: string
          id: string
          invoice_date: string
          invoice_number: string
          notes: string | null
          organization_id: string
          payment_terms: number | null
          status: string
          subtotal: number
          template_id: string | null
          total_amount: number
          updated_at: string
          vat_amount: number
          vat_percentage: number
          workspace_id: string | null
        }
        Insert: {
          client_address?: string | null
          client_city?: string | null
          client_country?: string | null
          client_email?: string | null
          client_name: string
          client_postal_code?: string | null
          created_at?: string
          created_by?: string | null
          due_date: string
          id?: string
          invoice_date?: string
          invoice_number: string
          notes?: string | null
          organization_id: string
          payment_terms?: number | null
          status?: string
          subtotal?: number
          template_id?: string | null
          total_amount?: number
          updated_at?: string
          vat_amount?: number
          vat_percentage?: number
          workspace_id?: string | null
        }
        Update: {
          client_address?: string | null
          client_city?: string | null
          client_country?: string | null
          client_email?: string | null
          client_name?: string
          client_postal_code?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string
          id?: string
          invoice_date?: string
          invoice_number?: string
          notes?: string | null
          organization_id?: string
          payment_terms?: number | null
          status?: string
          subtotal?: number
          template_id?: string | null
          total_amount?: number
          updated_at?: string
          vat_amount?: number
          vat_percentage?: number
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "document_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          account_name: string | null
          created_at: string
          email: string | null
          id: string
          organization_id: string
          organization_name: string | null
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          account_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          organization_id: string
          organization_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          account_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          organization_id?: string
          organization_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_organization_members_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_settings: {
        Row: {
          company_address: string | null
          company_bank: string | null
          company_city: string | null
          company_email: string | null
          company_kvk: string | null
          company_logo: string | null
          company_name: string | null
          company_phone: string | null
          company_postal_code: string | null
          company_vat: string | null
          company_website: string | null
          contact_prefix: string | null
          contact_start_number: number | null
          created_at: string
          customer_prefix: string | null
          customer_start_number: number | null
          default_payment_terms: number | null
          default_vat_rate: number | null
          id: string
          invoice_prefix: string | null
          invoice_start_number: number | null
          organization_id: string
          quote_prefix: string | null
          quote_start_number: number | null
          updated_at: string
        }
        Insert: {
          company_address?: string | null
          company_bank?: string | null
          company_city?: string | null
          company_email?: string | null
          company_kvk?: string | null
          company_logo?: string | null
          company_name?: string | null
          company_phone?: string | null
          company_postal_code?: string | null
          company_vat?: string | null
          company_website?: string | null
          contact_prefix?: string | null
          contact_start_number?: number | null
          created_at?: string
          customer_prefix?: string | null
          customer_start_number?: number | null
          default_payment_terms?: number | null
          default_vat_rate?: number | null
          id?: string
          invoice_prefix?: string | null
          invoice_start_number?: number | null
          organization_id: string
          quote_prefix?: string | null
          quote_start_number?: number | null
          updated_at?: string
        }
        Update: {
          company_address?: string | null
          company_bank?: string | null
          company_city?: string | null
          company_email?: string | null
          company_kvk?: string | null
          company_logo?: string | null
          company_name?: string | null
          company_phone?: string | null
          company_postal_code?: string | null
          company_vat?: string | null
          company_website?: string | null
          contact_prefix?: string | null
          contact_start_number?: number | null
          created_at?: string
          customer_prefix?: string | null
          customer_start_number?: number | null
          default_payment_terms?: number | null
          default_vat_rate?: number | null
          id?: string
          invoice_prefix?: string | null
          invoice_start_number?: number | null
          organization_id?: string
          quote_prefix?: string | null
          quote_start_number?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          updated_at: string
          users: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          updated_at?: string
          users?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string
          users?: Json | null
        }
        Relationships: []
      }
      pending_tasks: {
        Row: {
          assigned_to: string | null
          client_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          dossier_id: string | null
          due_date: string | null
          id: string
          organization_id: string
          priority: string
          status: string
          title: string
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          dossier_id?: string | null
          due_date?: string | null
          id?: string
          organization_id: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          dossier_id?: string | null
          due_date?: string | null
          id?: string
          organization_id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pending_tasks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_tasks_dossier_id_fkey"
            columns: ["dossier_id"]
            isOneToOne: false
            referencedRelation: "dossiers"
            referencedColumns: ["id"]
          },
        ]
      }
      phone_calls: {
        Row: {
          call_type: string
          client_id: string | null
          contact_name: string
          created_at: string
          created_by: string | null
          dossier_id: string | null
          duration: number | null
          id: string
          notes: string | null
          organization_id: string
          phone_number: string | null
          status: string
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          call_type?: string
          client_id?: string | null
          contact_name: string
          created_at?: string
          created_by?: string | null
          dossier_id?: string | null
          duration?: number | null
          id?: string
          notes?: string | null
          organization_id: string
          phone_number?: string | null
          status?: string
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          call_type?: string
          client_id?: string | null
          contact_name?: string
          created_at?: string
          created_by?: string | null
          dossier_id?: string | null
          duration?: number | null
          id?: string
          notes?: string | null
          organization_id?: string
          phone_number?: string | null
          status?: string
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "phone_calls_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "phone_calls_dossier_id_fkey"
            columns: ["dossier_id"]
            isOneToOne: false
            referencedRelation: "dossiers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
          user_role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
          user_role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      quote_lines: {
        Row: {
          created_at: string
          description: string
          id: string
          line_total: number
          quantity: number
          quote_id: string
          sort_order: number | null
          unit_price: number
          vat_rate: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          line_total: number
          quantity?: number
          quote_id: string
          sort_order?: number | null
          unit_price: number
          vat_rate?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          line_total?: number
          quantity?: number
          quote_id?: string
          sort_order?: number | null
          unit_price?: number
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_lines_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          client_address: string | null
          client_city: string | null
          client_country: string | null
          client_email: string | null
          client_name: string
          client_postal_code: string | null
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          organization_id: string
          quote_date: string
          quote_number: string
          status: string
          subtotal: number
          template_id: string | null
          total_amount: number
          updated_at: string
          valid_until: string
          vat_amount: number
          vat_percentage: number
          workspace_id: string | null
        }
        Insert: {
          client_address?: string | null
          client_city?: string | null
          client_country?: string | null
          client_email?: string | null
          client_name: string
          client_postal_code?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          quote_date?: string
          quote_number: string
          status?: string
          subtotal?: number
          template_id?: string | null
          total_amount?: number
          updated_at?: string
          valid_until: string
          vat_amount?: number
          vat_percentage?: number
          workspace_id?: string | null
        }
        Update: {
          client_address?: string | null
          client_city?: string | null
          client_country?: string | null
          client_email?: string | null
          client_name?: string
          client_postal_code?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          quote_date?: string
          quote_number?: string
          status?: string
          subtotal?: number
          template_id?: string | null
          total_amount?: number
          updated_at?: string
          valid_until?: string
          vat_amount?: number
          vat_percentage?: number
          workspace_id?: string | null
        }
        Relationships: []
      }
      user_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          organization_id: string | null
          role: Database["public"]["Enums"]["user_role"]
          token: string
          updated_at: string | null
          workspace_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          organization_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          token?: string
          updated_at?: string | null
          workspace_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          organization_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          token?: string
          updated_at?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_invitations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          created_at: string | null
          id: string
          menu_access: Json | null
          organization_id: string | null
          updated_at: string | null
          user_id: string | null
          workspace_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          menu_access?: Json | null
          organization_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          menu_access?: Json | null
          organization_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_permissions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      workspace_members: {
        Row: {
          account_name: string | null
          created_at: string
          email: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
          workspace_id: string
          workspace_name: string | null
        }
        Insert: {
          account_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
          workspace_id: string
          workspace_name?: string | null
        }
        Update: {
          account_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
          workspace_id?: string
          workspace_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_workspace_members_workspace"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          organization_id: string
          slug: string
          updated_at: string
          users: Json | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
          organization_id: string
          slug: string
          updated_at?: string
          users?: Json | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          organization_id?: string
          slug?: string
          updated_at?: string
          users?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_workspaces_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspaces_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_contact_number: {
        Args: { org_id: string }
        Returns: string
      }
      generate_invoice_number: {
        Args: { org_id: string; workspace_id?: string }
        Returns: string
      }
      generate_quote_number: {
        Args: { org_id: string; workspace_id?: string }
        Returns: string
      }
      get_user_org_role: {
        Args: { org_id: string; user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_user_organization_ids: {
        Args: { user_id: string }
        Returns: string[]
      }
      get_user_organization_role: {
        Args: { org_id: string; user_id: string }
        Returns: string
      }
      get_user_workspace_ids: {
        Args: { user_id: string }
        Returns: string[]
      }
      get_user_workspace_role: {
        Args: { workspace_id: string; user_id: string }
        Returns: string
      }
      is_org_admin_or_owner: {
        Args: { org_id: string; user_id: string }
        Returns: boolean
      }
      is_organization_member: {
        Args: { org_id: string; user_id: string }
        Returns: boolean
      }
      is_workspace_member: {
        Args: { workspace_id: string; user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "owner" | "admin" | "member"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["owner", "admin", "member"],
    },
  },
} as const
