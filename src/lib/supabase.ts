import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hovwddwgujmqxhjhoqqy.supabase.co';
const supabaseAnonKey ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvdndkZHdndWptcXhoamhvcXF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNzYzNjcsImV4cCI6MjA3NTg1MjM2N30.aJkNpwVRShRp3kDGg9io2sQdMFhSQPtUcjSc0IoSZWU"; // You'll need to provide this

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const BUCKET_ENDPOINT = 'https://hovwddwgujmqxhjhoqqy.storage.supabase.co/storage/v1/s3';
export const BUCKET_NAME = 'blog';



