export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: Record<
      string,
      {
        Row: Record<string, Json>;
        Insert: Record<string, Json | undefined>;
        Update: Record<string, Json | undefined>;
      }
    >;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, string>;
  };
}
