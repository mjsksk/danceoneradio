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
    PostgrestVersion: "14.1"
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
      app_downloads: {
        Row: {
          country: string | null
          country_code: string | null
          downloaded_at: string
          id: string
          platform: string
          version: string | null
          visitor_hash: string | null
        }
        Insert: {
          country?: string | null
          country_code?: string | null
          downloaded_at?: string
          id?: string
          platform?: string
          version?: string | null
          visitor_hash?: string | null
        }
        Update: {
          country?: string | null
          country_code?: string | null
          downloaded_at?: string
          id?: string
          platform?: string
          version?: string | null
          visitor_hash?: string | null
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
      push_notifications: {
        Row: {
          body: string
          id: string
          image_url: string | null
          recipient_count: number
          sent_at: string
          sent_by: string | null
          title: string
        }
        Insert: {
          body: string
          id?: string
          image_url?: string | null
          recipient_count?: number
          sent_at?: string
          sent_by?: string | null
          title: string
        }
        Update: {
          body?: string
          id?: string
          image_url?: string | null
          recipient_count?: number
          sent_at?: string
          sent_by?: string | null
          title?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
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
      sam_library: {
        Row: {
          artist: string
          artist_key: string | null
          artist_norm: string | null
          created_at: string
          filename: string
          full_key: string | null
          id: string
          normalized_artist: string
          normalized_artist_nospace: string | null
          normalized_title: string
          normalized_title_nospace: string | null
          title: string
          title_key: string | null
          title_norm: string | null
        }
        Insert: {
          artist: string
          artist_key?: string | null
          artist_norm?: string | null
          created_at?: string
          filename: string
          full_key?: string | null
          id?: string
          normalized_artist: string
          normalized_artist_nospace?: string | null
          normalized_title: string
          normalized_title_nospace?: string | null
          title: string
          title_key?: string | null
          title_norm?: string | null
        }
        Update: {
          artist?: string
          artist_key?: string | null
          artist_norm?: string | null
          created_at?: string
          filename?: string
          full_key?: string | null
          id?: string
          normalized_artist?: string
          normalized_artist_nospace?: string | null
          normalized_title?: string
          normalized_title_nospace?: string | null
          title?: string
          title_key?: string | null
          title_norm?: string | null
        }
        Relationships: []
      }
      scheduled_notifications: {
        Row: {
          body: string
          created_at: string
          created_by: string | null
          icon_url: string | null
          id: string
          recipient_count: number | null
          scheduled_at: string
          sent_at: string | null
          status: string
          title: string
        }
        Insert: {
          body: string
          created_at?: string
          created_by?: string | null
          icon_url?: string | null
          id?: string
          recipient_count?: number | null
          scheduled_at: string
          sent_at?: string | null
          status?: string
          title: string
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string | null
          icon_url?: string | null
          id?: string
          recipient_count?: number | null
          scheduled_at?: string
          sent_at?: string | null
          status?: string
          title?: string
        }
        Relationships: []
      }
      show_tracks: {
        Row: {
          album: string | null
          amazon_url: string | null
          apple_music_url: string | null
          artist: string
          beatport_url: string | null
          created_at: string
          duration_seconds: number | null
          episode_number: number
          id: string
          played_at: string | null
          title: string
          track_order: number
        }
        Insert: {
          album?: string | null
          amazon_url?: string | null
          apple_music_url?: string | null
          artist: string
          beatport_url?: string | null
          created_at?: string
          duration_seconds?: number | null
          episode_number: number
          id?: string
          played_at?: string | null
          title: string
          track_order: number
        }
        Update: {
          album?: string | null
          amazon_url?: string | null
          apple_music_url?: string | null
          artist?: string
          beatport_url?: string | null
          created_at?: string
          duration_seconds?: number | null
          episode_number?: number
          id?: string
          played_at?: string | null
          title?: string
          track_order?: number
        }
        Relationships: []
      }
      site_visits: {
        Row: {
          country: string | null
          country_code: string | null
          id: string
          is_returning: boolean
          page_path: string
          visited_at: string
          visitor_hash: string
        }
        Insert: {
          country?: string | null
          country_code?: string | null
          id?: string
          is_returning?: boolean
          page_path: string
          visited_at?: string
          visitor_hash: string
        }
        Update: {
          country?: string | null
          country_code?: string | null
          id?: string
          is_returning?: boolean
          page_path?: string
          visited_at?: string
          visitor_hash?: string
        }
        Relationships: []
      }
      song_requests: {
        Row: {
          admin_notes: string | null
          artist_name: string
          created_at: string
          duplicate_reason: string | null
          email: string | null
          id: string
          ip_address: string | null
          is_duplicate: boolean
          listener_name: string
          match_candidates: Json | null
          match_confidence: number | null
          match_method: string | null
          match_reason: string | null
          matched_artist: string | null
          matched_title: string | null
          message: string | null
          normalized_artist_name: string | null
          normalized_request_artist: string | null
          normalized_request_artist_nospace: string | null
          normalized_request_title: string | null
          normalized_request_title_nospace: string | null
          normalized_song_title: string | null
          req_artist_key: string | null
          req_artist_norm: string | null
          req_full_key: string | null
          req_title_key: string | null
          req_title_norm: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          sam_filename: string | null
          sam_imported_at: string | null
          song_title: string
          source: string | null
          status: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          admin_notes?: string | null
          artist_name: string
          created_at?: string
          duplicate_reason?: string | null
          email?: string | null
          id?: string
          ip_address?: string | null
          is_duplicate?: boolean
          listener_name: string
          match_candidates?: Json | null
          match_confidence?: number | null
          match_method?: string | null
          match_reason?: string | null
          matched_artist?: string | null
          matched_title?: string | null
          message?: string | null
          normalized_artist_name?: string | null
          normalized_request_artist?: string | null
          normalized_request_artist_nospace?: string | null
          normalized_request_title?: string | null
          normalized_request_title_nospace?: string | null
          normalized_song_title?: string | null
          req_artist_key?: string | null
          req_artist_norm?: string | null
          req_full_key?: string | null
          req_title_key?: string | null
          req_title_norm?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sam_filename?: string | null
          sam_imported_at?: string | null
          song_title: string
          source?: string | null
          status?: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          admin_notes?: string | null
          artist_name?: string
          created_at?: string
          duplicate_reason?: string | null
          email?: string | null
          id?: string
          ip_address?: string | null
          is_duplicate?: boolean
          listener_name?: string
          match_candidates?: Json | null
          match_confidence?: number | null
          match_method?: string | null
          match_reason?: string | null
          matched_artist?: string | null
          matched_title?: string | null
          message?: string | null
          normalized_artist_name?: string | null
          normalized_request_artist?: string | null
          normalized_request_artist_nospace?: string | null
          normalized_request_title?: string | null
          normalized_request_title_nospace?: string | null
          normalized_song_title?: string | null
          req_artist_key?: string | null
          req_artist_norm?: string | null
          req_full_key?: string | null
          req_title_key?: string | null
          req_title_norm?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sam_filename?: string | null
          sam_imported_at?: string | null
          song_title?: string
          source?: string | null
          status?: string
          updated_at?: string
          user_agent?: string | null
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
          city?: string | null
          country?: string | null
          device_type?: string | null
          id?: string | null
          is_active?: boolean | null
          masked_email?: never
          os?: string | null
          region?: string | null
          subscribed_at?: string | null
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          device_type?: string | null
          id?: string | null
          is_active?: boolean | null
          masked_email?: never
          os?: string | null
          region?: string | null
          subscribed_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      apply_song_request_match: {
        Args: { _request_id: string }
        Returns: {
          candidates_count: number
          id: string
          match_candidates: Json
          match_confidence: number
          match_method: string
          matched_artist: string
          matched_title: string
          no_match_reason: string
          normalized_request_artist: string
          normalized_request_artist_nospace: string
          normalized_request_title: string
          normalized_request_title_nospace: string
          sam_filename: string
        }[]
      }
      apply_song_request_matches: {
        Args: { _request_ids?: string[] }
        Returns: {
          candidates_count: number
          id: string
          match_candidates: Json
          match_confidence: number
          match_method: string
          matched_artist: string
          matched_title: string
          no_match_reason: string
          normalized_request_artist: string
          normalized_request_artist_nospace: string
          normalized_request_title: string
          normalized_request_title_nospace: string
          sam_filename: string
        }[]
      }
      basename_text: { Args: { value: string }; Returns: string }
      cleanup_old_notifications: { Args: never; Returns: undefined }
      cleanup_old_request_logs: { Args: never; Returns: undefined }
      cleanup_old_site_visits: { Args: never; Returns: undefined }
      cleanup_old_subscriber_tracking_data: { Args: never; Returns: undefined }
      cleanup_old_unsubscribe_attempts: { Args: never; Returns: undefined }
      effective_library_artist: {
        Args: { artist: string; filename: string }
        Returns: string
      }
      effective_library_title: {
        Args: { filename: string; title: string }
        Returns: string
      }
      get_download_stats: {
        Args: { end_date?: string; start_date?: string }
        Returns: {
          downloads_this_month: number
          downloads_this_week: number
          downloads_today: number
          total_downloads: number
        }[]
      }
      get_listener_analytics:
        | {
            Args: never
            Returns: {
              avg_progress: number
              completions: number
              episode_number: number
              episode_title: string
              last_activity: string
              total_time_played: number
              unique_listeners: number
            }[]
          }
        | {
            Args: { end_date?: string; start_date?: string }
            Returns: {
              avg_progress: number
              completions: number
              episode_number: number
              episode_title: string
              last_activity: string
              total_time_played: number
              unique_listeners: number
            }[]
          }
      get_listener_summary:
        | {
            Args: never
            Returns: {
              total_completions: number
              total_episodes_played: number
              total_listening_hours: number
              total_unique_listeners: number
            }[]
          }
        | {
            Args: { end_date?: string; start_date?: string }
            Returns: {
              total_completions: number
              total_episodes_played: number
              total_listening_hours: number
              total_unique_listeners: number
            }[]
          }
      get_song_request_debug_candidates: {
        Args: { _candidate_limit?: number; _request_id: string }
        Returns: {
          artist: string
          artist_key: string
          artist_norm: string
          confidence: number
          full_key: string
          library_id: string
          match_method: string
          priority: number
          relativefile: string
          similarity_score: number
          title: string
          title_key: string
          title_norm: string
        }[]
      }
      get_song_request_debug_candidates_by_values: {
        Args: {
          _candidate_limit?: number
          _req_artist_key: string
          _req_artist_norm: string
          _req_full_key: string
          _req_title_key: string
          _req_title_norm: string
        }
        Returns: {
          artist: string
          artist_key: string
          artist_norm: string
          confidence: number
          full_key: string
          library_id: string
          match_method: string
          priority: number
          relativefile: string
          similarity_score: number
          title: string
          title_key: string
          title_norm: string
        }[]
      }
      get_song_request_match_candidates: {
        Args: { _candidate_limit?: number; _request_id: string }
        Returns: {
          artist: string
          confidence: number
          filename: string
          library_id: string
          method: string
          normalized_artist: string
          normalized_artist_nospace: string
          normalized_title: string
          normalized_title_nospace: string
          priority: number
          title: string
        }[]
      }
      get_song_request_match_candidates_by_values: {
        Args: {
          _candidate_limit?: number
          _request_artist: string
          _request_artist_nospace: string
          _request_title: string
          _request_title_nospace: string
        }
        Returns: {
          artist: string
          confidence: number
          filename: string
          library_id: string
          method: string
          normalized_artist: string
          normalized_artist_nospace: string
          normalized_title: string
          normalized_title_nospace: string
          priority: number
          title: string
        }[]
      }
      get_subscriber_count: { Args: { before_date?: string }; Returns: number }
      get_subscriber_growth: {
        Args: { start_date: string }
        Returns: {
          is_active: boolean
          subscribed_at: string
        }[]
      }
      get_visitor_analytics: {
        Args: { end_date?: string; start_date?: string }
        Returns: {
          country: string
          country_code: string
          returning_visitors: number
          total_visits: number
          unique_visitors: number
        }[]
      }
      get_visitor_summary: {
        Args: { end_date?: string; start_date?: string }
        Returns: {
          returning_visitors: number
          top_country: string
          total_visits: number
          unique_visitors: number
        }[]
      }
      get_visitor_trend: {
        Args: { end_date?: string; granularity?: string; start_date?: string }
        Returns: {
          period: string
          total_visits: number
          unique_visitors: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      library_filename_artist: { Args: { value: string }; Returns: string }
      library_filename_stem: { Args: { value: string }; Returns: string }
      library_filename_title: { Args: { value: string }; Returns: string }
      normalize_match_value: { Args: { value: string }; Returns: string }
      normalize_match_value_nospace: {
        Args: { value: string }
        Returns: string
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
