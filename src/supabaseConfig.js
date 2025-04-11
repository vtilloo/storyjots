import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bkslbmilymrwcattyxhk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrc2xibWlseW1yd2NhdHR5eGhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0NDc0OTgsImV4cCI6MjA1NDAyMzQ5OH0.9y-0jOhWZ9pMcv5I8cVuUbfLF8OqCcGjIg_BoYfUEXg';


export const supabase = createClient(supabaseUrl, supabaseAnonKey); 