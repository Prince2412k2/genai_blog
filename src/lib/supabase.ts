import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hovwddwgujmqxhjhoqqy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvdndkZHdndWptcXhoamhvcXF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NTU0MTIsImV4cCI6MjA1MTIzMTQxMn0.6_0rG5vQ8YqZvKqQxQpQxQpQxQpQxQpQxQpQxQpQxQp'; // You'll need to provide this

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const BUCKET_ENDPOINT = 'https://hovwddwgujmqxhjhoqqy.storage.supabase.co/storage/v1/s3';
export const BUCKET_NAME = 'blog';
