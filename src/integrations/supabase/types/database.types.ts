
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      documents: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          file_path: string
          file_type: string
          file_size: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          file_path: string
          file_type: string
          file_size?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          file_path?: string
          file_type?: string
          file_size?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string | null
          phone: string | null
          name: string | null
          age: number | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email?: string | null
          phone?: string | null
          name?: string | null
          age?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string | null
          phone?: string | null
          name?: string | null
          age?: number | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          id: string
          name: string
          owner: string | null
          created_at: string | null
          updated_at: string | null
          public: boolean | null
        }
        Insert: {
          id: string
          name: string
          owner?: string | null
          created_at?: string | null
          updated_at?: string | null
          public?: boolean | null
        }
        Update: {
          id?: string
          name?: string
          owner?: string | null
          created_at?: string | null
          updated_at?: string | null
          public?: boolean | null
        }
      }
      objects: {
        Row: {
          id: string
          bucket_id: string
          name: string
          owner: string | null
          created_at: string | null
          updated_at: string | null
          metadata: Json | null
          path_tokens: string[] | null
        }
        Insert: {
          id?: string
          bucket_id: string
          name: string
          owner?: string | null
          created_at?: string | null
          updated_at?: string | null
          metadata?: Json | null
          path_tokens?: string[] | null
        }
        Update: {
          id?: string
          bucket_id?: string
          name?: string
          owner?: string | null
          created_at?: string | null
          updated_at?: string | null
          metadata?: Json | null
          path_tokens?: string[] | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
