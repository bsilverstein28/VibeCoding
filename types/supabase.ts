export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          website: string | null
          description: string | null
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          website?: string | null
          description?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          website?: string | null
          description?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      news_articles: {
        Row: {
          id: string
          company_id: string
          title: string
          url: string
          source: string | null
          published_date: string | null
          summary: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          title: string
          url: string
          source?: string | null
          published_date?: string | null
          summary?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          title?: string
          url?: string
          source?: string | null
          published_date?: string | null
          summary?: string | null
          created_at?: string
        }
      }
      daily_summaries: {
        Row: {
          id: string
          summary_date: string
          summary_text: string
          created_at: string
        }
        Insert: {
          id?: string
          summary_date: string
          summary_text: string
          created_at?: string
        }
        Update: {
          id?: string
          summary_date?: string
          summary_text?: string
          created_at?: string
        }
      }
      summary_companies: {
        Row: {
          summary_id: string
          company_id: string
        }
        Insert: {
          summary_id: string
          company_id: string
        }
        Update: {
          summary_id?: string
          company_id?: string
        }
      }
      summary_articles: {
        Row: {
          summary_id: string
          article_id: string
        }
        Insert: {
          summary_id: string
          article_id: string
        }
        Update: {
          summary_id?: string
          article_id?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          email_notifications: boolean
          notification_time: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email_notifications?: boolean
          notification_time?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email_notifications?: boolean
          notification_time?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
