// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://guaexbidzyhhdqtbcofv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWV4YmlkenloaGRxdGJjb2Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0NjU5MjcsImV4cCI6MjA0OTA0MTkyN30.VFa_64oXnhW3x2GFM_-n4cfOeFNgm3TucsWB6-uTS7A";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);