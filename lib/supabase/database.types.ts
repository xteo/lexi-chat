export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      chats: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          created_at: string;
          visibility: 'public' | 'private';
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          created_at?: string;
          visibility?: 'public' | 'private';
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          created_at?: string;
          visibility?: 'public' | 'private';
        };
        Relationships: [
          {
            foreignKeyName: 'chats_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      messages: {
        Row: {
          id: string;
          chat_id: string;
          role: string;
          parts: Json;
          attachments: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          chat_id: string;
          role: string;
          parts: Json;
          attachments: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          chat_id?: string;
          role?: string;
          parts?: Json;
          attachments?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'messages_chat_id_fkey';
            columns: ['chat_id'];
            isOneToOne: false;
            referencedRelation: 'chats';
            referencedColumns: ['id'];
          }
        ];
      };
      documents: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string | null;
          kind: 'text' | 'code' | 'image' | 'sheet';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content?: string | null;
          kind?: 'text' | 'code' | 'image' | 'sheet';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string | null;
          kind?: 'text' | 'code' | 'image' | 'sheet';
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'documents_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      suggestions: {
        Row: {
          id: string;
          document_id: string;
          document_created_at: string;
          original_text: string;
          suggested_text: string;
          description: string | null;
          is_resolved: boolean;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          document_created_at: string;
          original_text: string;
          suggested_text: string;
          description?: string | null;
          is_resolved?: boolean;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          document_id?: string;
          document_created_at?: string;
          original_text?: string;
          suggested_text?: string;
          description?: string | null;
          is_resolved?: boolean;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'suggestions_document_fkey';
            columns: ['document_id', 'document_created_at'];
            isOneToOne: false;
            referencedRelation: 'documents';
            referencedColumns: ['id', 'created_at'];
          },
          {
            foreignKeyName: 'suggestions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      votes: {
        Row: {
          chat_id: string;
          message_id: string;
          is_upvoted: boolean;
        };
        Insert: {
          chat_id: string;
          message_id: string;
          is_upvoted: boolean;
        };
        Update: {
          chat_id?: string;
          message_id?: string;
          is_upvoted?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'votes_chat_id_fkey';
            columns: ['chat_id'];
            isOneToOne: false;
            referencedRelation: 'chats';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'votes_message_id_fkey';
            columns: ['message_id'];
            isOneToOne: false;
            referencedRelation: 'messages';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};