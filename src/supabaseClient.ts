import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://hevyladjfoexdzyhtjwx.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhldnlsYWRqZm9leGR6eWh0and4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MDUzMzgsImV4cCI6MjA5NTM4MTMzOH0.kG3Ra4vPbOmwbgfqgK353SaSyQDBrk-DU9OWtKNMioA'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
