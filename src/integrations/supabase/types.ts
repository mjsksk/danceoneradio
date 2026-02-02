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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      api_keys: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          key_hash: string
          last_used_at: string | null
          service_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          key_hash: string
          last_used_at?: string | null
          service_name: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          key_hash?: string
          last_used_at?: string | null
          service_name?: string
        }
        Relationships: []
      }
      api_request_log: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          identifier: string
          success: boolean | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          identifier: string
          success?: boolean | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          identifier?: string
          success?: boolean | null
          user_agent?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          subject?: string
        }
        Relationships: []
      }
      edm_news_articles: {
        Row: {
          category: Database["public"]["Enums"]["news_category"]
          content: string | null
          created_at: string
          fetched_at: string
          id: string
          image_url: string | null
          is_featured: boolean
          published_at: string
          slug: string
          source_name: string
          source_url: string
          summary: string
          tags: string[] | null
          title: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["news_category"]
          content?: string | null
          created_at?: string
          fetched_at?: string
          id?: string
          image_url?: string | null
          is_featured?: boolean
          published_at?: string
          slug: string
          source_name: string
          source_url: string
          summary: string
          tags?: string[] | null
          title: string
        }
        Update: {
          category?: Database["public"]["Enums"]["news_category"]
          content?: string | null
          created_at?: string
          fetched_at?: string
          id?: string
          image_url?: string | null
          is_featured?: boolean
          published_at?: string
          slug?: string
          source_name?: string
          source_url?: string
          summary?: string
          tags?: string[] | null
          title?: string
        }
        Relationships: []
      }
      episode_listening_progress: {
        Row: {
          audio_url: string
          completed: boolean | null
          created_at: string | null
          duration: number
          episode_number: number
          episode_title: string
          id: string
          last_listened_at: string | null
          playback_position: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          audio_url: string
          completed?: boolean | null
          created_at?: string | null
          duration?: number
          episode_number: number
          episode_title: string
          id?: string
          last_listened_at?: string | null
          playback_position?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          audio_url?: string
          completed?: boolean | null
          created_at?: string | null
          duration?: number
          episode_number?: number
          episode_title?: string
          id?: string
          last_listened_at?: string | null
          playback_position?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      newsletter_campaigns: {
        Row: {
          content: string
          created_at: string
          id: string
          recipient_count: number
          sent_at: string
          sent_by: string | null
          subject: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          recipient_count?: number
          sent_at?: string
          sent_by?: string | null
          subject: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          recipient_count?: number
          sent_at?: string
          sent_by?: string | null
          subject?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          created_at: string
          device_type: string | null
          email: string
          id: string
          ip_address: string | null
          is_active: boolean
          os: string | null
          region: string | null
          subscribed_at: string
          unsubscribe_token: string
          updated_at: string
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          email: string
          id?: string
          ip_address?: string | null
          is_active?: boolean
          os?: string | null
          region?: string | null
          subscribed_at?: string
          unsubscribe_token?: string
          updated_at?: string
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          email?: string
          id?: string
          ip_address?: string | null
          is_active?: boolean
          os?: string | null
          region?: string | null
          subscribed_at?: string
          unsubscribe_token?: string
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_templates: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          display_name: string | null
          email: string
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          email: string
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          email?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      radio_track_history: {
        Row: {
          artist: string
          created_at: string
          duration: string | null
          genre: string | null
          id: string
          played_at: string
          source_url: string | null
          title: string
        }
        Insert: {
          artist: string
          created_at?: string
          duration?: string | null
          genre?: string | null
          id?: string
          played_at?: string
          source_url?: string | null
          title: string
        }
        Update: {
          artist?: string
          created_at?: string
          duration?: string | null
          genre?: string | null
          id?: string
          played_at?: string
          source_url?: string | null
          title?: string
        }
        Relationships: []
      }
      unsubscribe_attempts: {
        Row: {
          attempted_at: string
          id: string
          ip_address: string
          success: boolean | null
        }
        Insert: {
          attempted_at?: string
          id?: string
          ip_address: string
          success?: boolean | null
        }
        Update: {
          attempted_at?: string
          id?: string
          ip_address?: string
          success?: boolean | null
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
          role: Database["public"]["Enums"]["app_role"]
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
      newsletter_subscribers_admin: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          device_type: string | null
          id: string | null
          is_active: boolean | null
          masked_email: string | null
          os: string | null
          region: string | null
          subscribed_at: string | null
        }
        Insert: {
          browser?: string | null
          city?: never
          country?: string | null
          device_type?: string | null
          id?: string | null
          is_active?: boolean | null
          masked_email?: never
          os?: string | null
          region?: never
          subscribed_at?: string | null
        }
        Update: {
          browser?: string | null
          city?: never
          country?: string | null
          device_type?: string | null
          id?: string | null
          is_active?: boolean | null
          masked_email?: never
          os?: string | null
          region?: never
          subscribed_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_old_request_logs: { Args: never; Returns: undefined }
      cleanup_old_subscriber_tracking_data: { Args: never; Returns: undefined }
      cleanup_old_unsubscribe_attempts: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      validate_unsubscribe_token: {
        Args: { token_input: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      news_category: "headline" | "release" | "event" | "artist" | "industry"
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
      app_role: ["admin", "moderator", "user"],
      news_category: ["headline", "release", "event", "artist", "industry"],
    },
  },
} as const
