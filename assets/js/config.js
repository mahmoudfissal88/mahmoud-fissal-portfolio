// ============================================================
// Supabase configuration
// Fill these two values after creating the Supabase project
// (Project Settings -> API). Until then the site runs in
// preview mode with the built-in default content.
// ============================================================
const SUPABASE_URL = "";      // e.g. "https://abcdefgh.supabase.co"
const SUPABASE_ANON_KEY = ""; // "eyJhbGciOi..." (anon public key)

// The admin panel logs in with a username; Supabase Auth works
// with emails, so the username is mapped to this synthetic domain.
// The matching auth user must be created in the Supabase dashboard
// (Authentication -> Users -> Add user) with email
// "<username>@mf-portfolio.local" and the chosen password.
const ADMIN_EMAIL_DOMAIN = "mf-portfolio.local";
