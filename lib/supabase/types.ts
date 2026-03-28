export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      professional_profiles: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          contexts: Json;
          active_context_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string | null;
          contexts?: Json;
          active_context_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string | null;
          contexts?: Json;
          active_context_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      dev_feedback_log: {
        Row: {
          id: string;
          session_date: string;
          patient_zone: string[] | null;
          patient_profile: string | null;
          patient_age: number | null;
          context_id: string | null;
          hypotheses_generated: Json | null;
          top_hypothesis: string | null;
          discriminatory_questions: Json | null;
          clinical_tests_suggested: Json | null;
          therapy_proposed: Json | null;
          diagnostic_accuracy: string | null;
          utility: string | null;
          difficulty: string | null;
          notes: string | null;
          raw_session_state: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_date?: string;
          patient_zone?: string[] | null;
          patient_profile?: string | null;
          patient_age?: number | null;
          context_id?: string | null;
          hypotheses_generated?: Json | null;
          top_hypothesis?: string | null;
          discriminatory_questions?: Json | null;
          clinical_tests_suggested?: Json | null;
          therapy_proposed?: Json | null;
          diagnostic_accuracy?: string | null;
          utility?: string | null;
          difficulty?: string | null;
          notes?: string | null;
          raw_session_state?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_date?: string;
          patient_zone?: string[] | null;
          patient_profile?: string | null;
          patient_age?: number | null;
          context_id?: string | null;
          hypotheses_generated?: Json | null;
          top_hypothesis?: string | null;
          discriminatory_questions?: Json | null;
          clinical_tests_suggested?: Json | null;
          therapy_proposed?: Json | null;
          diagnostic_accuracy?: string | null;
          utility?: string | null;
          difficulty?: string | null;
          notes?: string | null;
          raw_session_state?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
