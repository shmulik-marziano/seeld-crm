export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_analyses: {
        Row: {
          agent_id: string
          analysis_data: Json
          client_id: string
          cost_efficiency_score: number | null
          coverage_score: number | null
          created_at: string | null
          gaps: Json | null
          id: string
          opportunities: Json | null
          overall_score: number | null
          recommendations: Json | null
          report_sent_at: string | null
          report_url: string | null
        }
        Insert: {
          agent_id: string
          analysis_data?: Json
          client_id: string
          cost_efficiency_score?: number | null
          coverage_score?: number | null
          created_at?: string | null
          gaps?: Json | null
          id?: string
          opportunities?: Json | null
          overall_score?: number | null
          recommendations?: Json | null
          report_sent_at?: string | null
          report_url?: string | null
        }
        Update: {
          agent_id?: string
          analysis_data?: Json
          client_id?: string
          cost_efficiency_score?: number | null
          coverage_score?: number | null
          created_at?: string | null
          gaps?: Json | null
          id?: string
          opportunities?: Json | null
          overall_score?: number | null
          recommendations?: Json | null
          report_sent_at?: string | null
          report_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_analyses_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          action_url: string | null
          agent_id: string
          client_id: string | null
          created_at: string | null
          id: string
          lead_id: string | null
          message: string
          policy_id: string | null
          read_at: string | null
          title: string
          type: Database["public"]["Enums"]["alert_type"]
        }
        Insert: {
          action_url?: string | null
          agent_id: string
          client_id?: string | null
          created_at?: string | null
          id?: string
          lead_id?: string | null
          message: string
          policy_id?: string | null
          read_at?: string | null
          title: string
          type: Database["public"]["Enums"]["alert_type"]
        }
        Update: {
          action_url?: string | null
          agent_id?: string
          client_id?: string | null
          created_at?: string | null
          id?: string
          lead_id?: string | null
          message?: string
          policy_id?: string | null
          read_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["alert_type"]
        }
        Relationships: [
          {
            foreignKeyName: "alerts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policies"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_transactions: {
        Row: {
          agent_id: string
          amount: number
          created_at: string | null
          description: string | null
          id: string
          matched: boolean | null
          transaction_date: string
          transaction_id: string
        }
        Insert: {
          agent_id: string
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          matched?: boolean | null
          transaction_date: string
          transaction_id: string
        }
        Update: {
          agent_id?: string
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          matched?: boolean | null
          transaction_date?: string
          transaction_id?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          agent_id: string
          analysis_score: number | null
          bank_data: Json | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          full_name: string
          har_bituach_data: Json | null
          id: string
          id_number: string | null
          last_analysis_date: string | null
          mislaka_data: Json | null
          onboarding_completed_at: string | null
          phone: string
          status: Database["public"]["Enums"]["client_status"] | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          agent_id: string
          analysis_score?: number | null
          bank_data?: Json | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          full_name: string
          har_bituach_data?: Json | null
          id?: string
          id_number?: string | null
          last_analysis_date?: string | null
          mislaka_data?: Json | null
          onboarding_completed_at?: string | null
          phone: string
          status?: Database["public"]["Enums"]["client_status"] | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          agent_id?: string
          analysis_score?: number | null
          bank_data?: Json | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          full_name?: string
          har_bituach_data?: Json | null
          id?: string
          id_number?: string | null
          last_analysis_date?: string | null
          mislaka_data?: Json | null
          onboarding_completed_at?: string | null
          phone?: string
          status?: Database["public"]["Enums"]["client_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      commissions: {
        Row: {
          agent_id: string
          amount: number
          bank_transaction_id: string | null
          client_id: string | null
          created_at: string | null
          currency: string | null
          expected_date: string | null
          id: string
          matched_automatically: boolean | null
          notes: string | null
          policy_id: string | null
          received_date: string | null
          status: Database["public"]["Enums"]["commission_status"] | null
          updated_at: string | null
        }
        Insert: {
          agent_id: string
          amount: number
          bank_transaction_id?: string | null
          client_id?: string | null
          created_at?: string | null
          currency?: string | null
          expected_date?: string | null
          id?: string
          matched_automatically?: boolean | null
          notes?: string | null
          policy_id?: string | null
          received_date?: string | null
          status?: Database["public"]["Enums"]["commission_status"] | null
          updated_at?: string | null
        }
        Update: {
          agent_id?: string
          amount?: number
          bank_transaction_id?: string | null
          client_id?: string | null
          created_at?: string | null
          currency?: string | null
          expected_date?: string | null
          id?: string
          matched_automatically?: boolean | null
          notes?: string | null
          policy_id?: string | null
          received_date?: string | null
          status?: Database["public"]["Enums"]["commission_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commissions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policies"
            referencedColumns: ["id"]
          },
        ]
      }
      forms: {
        Row: {
          agent_id: string
          client_id: string
          company_reference_number: string | null
          created_at: string | null
          docusign_envelope_id: string | null
          form_data: Json
          form_type: string
          id: string
          meeting_id: string | null
          signed_at: string | null
          status: Database["public"]["Enums"]["form_status"] | null
          submitted_to_company_at: string | null
          updated_at: string | null
        }
        Insert: {
          agent_id: string
          client_id: string
          company_reference_number?: string | null
          created_at?: string | null
          docusign_envelope_id?: string | null
          form_data?: Json
          form_type: string
          id?: string
          meeting_id?: string | null
          signed_at?: string | null
          status?: Database["public"]["Enums"]["form_status"] | null
          submitted_to_company_at?: string | null
          updated_at?: string | null
        }
        Update: {
          agent_id?: string
          client_id?: string
          company_reference_number?: string | null
          created_at?: string | null
          docusign_envelope_id?: string | null
          form_data?: Json
          form_type?: string
          id?: string
          meeting_id?: string | null
          signed_at?: string | null
          status?: Database["public"]["Enums"]["form_status"] | null
          submitted_to_company_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forms_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forms_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_agent_id: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          message: string | null
          phone: string
          service_type: string
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
        }
        Insert: {
          assigned_agent_id?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          message?: string | null
          phone: string
          service_type: string
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Update: {
          assigned_agent_id?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message?: string | null
          phone?: string
          service_type?: string
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Relationships: []
      }
      meetings: {
        Row: {
          action_items: Json | null
          agent_id: string
          ai_summary: string | null
          client_id: string
          completed_at: string | null
          created_at: string | null
          follow_up_tasks: Json | null
          id: string
          next_meeting_at: string | null
          scheduled_at: string | null
          status: Database["public"]["Enums"]["meeting_status"] | null
          updated_at: string | null
          voice_recording_url: string | null
          voice_transcription: string | null
        }
        Insert: {
          action_items?: Json | null
          agent_id: string
          ai_summary?: string | null
          client_id: string
          completed_at?: string | null
          created_at?: string | null
          follow_up_tasks?: Json | null
          id?: string
          next_meeting_at?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["meeting_status"] | null
          updated_at?: string | null
          voice_recording_url?: string | null
          voice_transcription?: string | null
        }
        Update: {
          action_items?: Json | null
          agent_id?: string
          ai_summary?: string | null
          client_id?: string
          completed_at?: string | null
          created_at?: string | null
          follow_up_tasks?: Json | null
          id?: string
          next_meeting_at?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["meeting_status"] | null
          updated_at?: string | null
          voice_recording_url?: string | null
          voice_transcription?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meetings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          policy_id: string | null
          priority: Database["public"]["Enums"]["notification_priority"]
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          policy_id?: string | null
          priority?: Database["public"]["Enums"]["notification_priority"]
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          policy_id?: string | null
          priority?: Database["public"]["Enums"]["notification_priority"]
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policies"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_history: {
        Row: {
          coverage_score: number
          created_at: string
          id: string
          performance_rating: string
          performance_score: number
          policy_score: number
          premium_score: number
          total_coverage: number
          total_policies: number
          total_premium: number
          user_id: string
        }
        Insert: {
          coverage_score: number
          created_at?: string
          id?: string
          performance_rating: string
          performance_score: number
          policy_score: number
          premium_score: number
          total_coverage: number
          total_policies: number
          total_premium: number
          user_id: string
        }
        Update: {
          coverage_score?: number
          created_at?: string
          id?: string
          performance_rating?: string
          performance_score?: number
          policy_score?: number
          premium_score?: number
          total_coverage?: number
          total_policies?: number
          total_premium?: number
          user_id?: string
        }
        Relationships: []
      }
      policies: {
        Row: {
          coverage_amount: number
          created_at: string
          end_date: string | null
          id: string
          policy_number: string
          premium: number
          provider: string
          start_date: string
          status: Database["public"]["Enums"]["policy_status"]
          type: Database["public"]["Enums"]["policy_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          coverage_amount: number
          created_at?: string
          end_date?: string | null
          id?: string
          policy_number: string
          premium: number
          provider: string
          start_date: string
          status?: Database["public"]["Enums"]["policy_status"]
          type: Database["public"]["Enums"]["policy_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          coverage_amount?: number
          created_at?: string
          end_date?: string | null
          id?: string
          policy_number?: string
          premium?: number
          provider?: string
          start_date?: string
          status?: Database["public"]["Enums"]["policy_status"]
          type?: Database["public"]["Enums"]["policy_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string
          date_of_birth: string | null
          full_name: string
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_name: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recommendation_tracking: {
        Row: {
          actual_savings: number | null
          completion_date: string | null
          created_at: string
          id: string
          implementation_date: string | null
          metadata: Json | null
          notes: string | null
          predicted_savings: number
          recommendation_id: string
          recommendation_title: string
          recommendation_type: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_savings?: number | null
          completion_date?: string | null
          created_at?: string
          id?: string
          implementation_date?: string | null
          metadata?: Json | null
          notes?: string | null
          predicted_savings?: number
          recommendation_id: string
          recommendation_title: string
          recommendation_type: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_savings?: number | null
          completion_date?: string | null
          created_at?: string
          id?: string
          implementation_date?: string | null
          metadata?: Json | null
          notes?: string | null
          predicted_savings?: number
          recommendation_id?: string
          recommendation_title?: string
          recommendation_type?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      alert_type:
        | "commission"
        | "policy_expiring"
        | "new_lead"
        | "client_activity"
      app_role: "admin" | "agent" | "client"
      client_status: "new" | "active" | "inactive" | "archived"
      commission_status: "pending" | "received" | "disputed"
      form_status:
        | "draft"
        | "pending_signature"
        | "signed"
        | "submitted"
        | "approved"
        | "rejected"
      lead_status: "new" | "contacted" | "qualified" | "converted" | "lost"
      meeting_status: "scheduled" | "completed" | "cancelled"
      notification_priority: "low" | "medium" | "high" | "urgent"
      notification_type:
        | "policy_expiring"
        | "high_premium"
        | "savings_opportunity"
        | "renewal_reminder"
      policy_status: "active" | "pending" | "lapsed" | "cancelled"
      policy_type:
        | "life_insurance"
        | "health_insurance"
        | "pension"
        | "disability_insurance"
        | "property_insurance"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      alert_type: [
        "commission",
        "policy_expiring",
        "new_lead",
        "client_activity",
      ],
      app_role: ["admin", "agent", "client"],
      client_status: ["new", "active", "inactive", "archived"],
      commission_status: ["pending", "received", "disputed"],
      form_status: [
        "draft",
        "pending_signature",
        "signed",
        "submitted",
        "approved",
        "rejected",
      ],
      lead_status: ["new", "contacted", "qualified", "converted", "lost"],
      meeting_status: ["scheduled", "completed", "cancelled"],
      notification_priority: ["low", "medium", "high", "urgent"],
      notification_type: [
        "policy_expiring",
        "high_premium",
        "savings_opportunity",
        "renewal_reminder",
      ],
      policy_status: ["active", "pending", "lapsed", "cancelled"],
      policy_type: [
        "life_insurance",
        "health_insurance",
        "pension",
        "disability_insurance",
        "property_insurance",
      ],
    },
  },
} as const
