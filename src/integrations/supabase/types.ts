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
      admin_users: {
        Row: {
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      favorite_folders: {
        Row: {
          created_at: string
          creator_id: string
          id: string
          playlist_name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          id?: string
          playlist_name: string
          user_id: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          id?: string
          playlist_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorite_folders_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorite_folders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcards: {
        Row: {
          back: string
          created_at: string
          creator_id: string
          description: string | null
          front: string
          id: string
          is_public: boolean
          last_modified_at: string | null
          last_modified_by: string | null
          modification_history: Json[] | null
          playlist_name: string | null
          recipient_can_modify: boolean
          recipient_id: string | null
          share_code: string | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          back: string
          created_at?: string
          creator_id: string
          description?: string | null
          front: string
          id?: string
          is_public?: boolean
          last_modified_at?: string | null
          last_modified_by?: string | null
          modification_history?: Json[] | null
          playlist_name?: string | null
          recipient_can_modify?: boolean
          recipient_id?: string | null
          share_code?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          back?: string
          created_at?: string
          creator_id?: string
          description?: string | null
          front?: string
          id?: string
          is_public?: boolean
          last_modified_at?: string | null
          last_modified_by?: string | null
          modification_history?: Json[] | null
          playlist_name?: string | null
          recipient_can_modify?: boolean
          recipient_id?: string | null
          share_code?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flashcards_last_modified_by_fkey"
            columns: ["last_modified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flashcards_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      friend_connections: {
        Row: {
          created_at: string
          friend_id: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_id: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          friend_id?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "friend_connections_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          content: Json | null
          created_at: string | null
          id: string
          read: boolean | null
          recipient_id: string
          sender_id: string
          type: string
          updated_at: string | null
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          id?: string
          read?: boolean | null
          recipient_id: string
          sender_id: string
          type: string
          updated_at?: string | null
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          id?: string
          read?: boolean | null
          recipient_id?: string
          sender_id?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      playlist_leaderboards: {
        Row: {
          created_at: string
          creator_id: string
          id: string
          playlist_name: string
          points: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          id?: string
          playlist_name: string
          points?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          id?: string
          playlist_name?: string
          points?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlist_leaderboards_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_leaderboards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      playlist_permissions: {
        Row: {
          can_modify: boolean
          created_at: string | null
          creator_id: string
          id: string
          playlist_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          can_modify?: boolean
          created_at?: string | null
          creator_id: string
          id?: string
          playlist_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          can_modify?: boolean
          created_at?: string | null
          creator_id?: string
          id?: string
          playlist_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlist_permissions_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string
          id: string
          is_test_account: boolean | null
          status: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name: string
          id: string
          is_test_account?: boolean | null
          status?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          id?: string
          is_test_account?: boolean | null
          status?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      quests: {
        Row: {
          created_at: string
          description: string
          id: string
          is_daily: boolean
          requirement_count: number
          title: string
          type: string
          updated_at: string
          xp_reward: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          is_daily?: boolean
          requirement_count?: number
          title: string
          type: string
          updated_at?: string
          xp_reward?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_daily?: boolean
          requirement_count?: number
          title?: string
          type?: string
          updated_at?: string
          xp_reward?: number
        }
        Relationships: []
      }
      theme_colors: {
        Row: {
          base: string
          foreground: string
          id: string
          name: string
        }
        Insert: {
          base: string
          foreground: string
          id?: string
          name: string
        }
        Update: {
          base?: string
          foreground?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_feedback: {
        Row: {
          content: string
          created_at: string
          id: string
          status: string | null
          type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          status?: string | null
          type: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          status?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_quests: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          expires_at: string | null
          id: string
          progress: number
          quest_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          progress?: number
          quest_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          progress?: number
          quest_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_quests_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "quests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_quests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_streaks: {
        Row: {
          best_leaderboard_rank: number | null
          created_at: string
          current_streak: number | null
          highest_streak: number | null
          highest_study_minutes: number | null
          id: string
          last_activity_date: string | null
          level: number | null
          monthly_points: number | null
          most_competitive_rank: number | null
          most_competitive_total_players: number | null
          next_level_xp: number | null
          perfect_playlists: number | null
          total_playlists_created: number | null
          total_points: number | null
          updated_at: string
          user_id: string
          weekly_points: number | null
          xp: number | null
        }
        Insert: {
          best_leaderboard_rank?: number | null
          created_at?: string
          current_streak?: number | null
          highest_streak?: number | null
          highest_study_minutes?: number | null
          id?: string
          last_activity_date?: string | null
          level?: number | null
          monthly_points?: number | null
          most_competitive_rank?: number | null
          most_competitive_total_players?: number | null
          next_level_xp?: number | null
          perfect_playlists?: number | null
          total_playlists_created?: number | null
          total_points?: number | null
          updated_at?: string
          user_id: string
          weekly_points?: number | null
          xp?: number | null
        }
        Update: {
          best_leaderboard_rank?: number | null
          created_at?: string
          current_streak?: number | null
          highest_streak?: number | null
          highest_study_minutes?: number | null
          id?: string
          last_activity_date?: string | null
          level?: number | null
          monthly_points?: number | null
          most_competitive_rank?: number | null
          most_competitive_total_players?: number | null
          next_level_xp?: number | null
          perfect_playlists?: number | null
          total_playlists_created?: number | null
          total_points?: number | null
          updated_at?: string
          user_id?: string
          weekly_points?: number | null
          xp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_streaks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_daily_quests: {
        Args: {
          user_id_param: string
        }
        Returns: undefined
      }
      award_user_xp: {
        Args: {
          user_id_param: string
          xp_amount: number
        }
        Returns: undefined
      }
      calculate_next_level_xp: {
        Args: {
          current_level: number
        }
        Returns: number
      }
      check_daily_quests_completion: {
        Args: {
          user_id_param: string
        }
        Returns: undefined
      }
      check_is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      delete_test_accounts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_user_email_from_identifier: {
        Args: {
          identifier: string
        }
        Returns: string
      }
      handle_midnight_updates: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      is_admin_no_rls: {
        Args: {
          uid: string
        }
        Returns: boolean
      }
      update_leaderboard_rankings: {
        Args: {
          user_id_param: string
        }
        Returns: undefined
      }
      update_leaderboard_score: {
        Args: {
          user_id_param: string
          playlist_name_param: string
          creator_id_param: string
          score: number
        }
        Returns: undefined
      }
      update_perfect_playlist_count: {
        Args: {
          user_id_param: string
        }
        Returns: undefined
      }
      update_total_playlists_created: {
        Args: {
          user_id_param: string
        }
        Returns: undefined
      }
      update_user_streak: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      wipe_all_user_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
