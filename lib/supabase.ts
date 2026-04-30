import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// We provide empty strings if variables are missing to avoid crash during build-time prerendering.
// Vercel build will succeed even if variables are not present during build, 
// as long as they are provided at runtime.
export const supabase = createClient(
  supabaseUrl || 'https://empty-url-for-build.supabase.co', 
  supabaseAnonKey || 'empty-key-for-build'
)
