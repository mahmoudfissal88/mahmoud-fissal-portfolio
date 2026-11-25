# Mahmoud Fissal — Portfolio

A bilingual (Arabic/English), dual-theme (light/dark) portfolio site for a graphic
designer & instructional developer, with an admin panel to edit every part of the
visitor page. Static front-end + Supabase backend.

## Structure

```
index.html              Visitor page
admin.html              Admin panel (username + password)
assets/css/style.css    Styles, themes, animations
assets/js/config.js     Supabase URL + anon key (fill after setup)
assets/js/content.js    Built-in default content (fallback when DB is offline)
assets/js/main.js       Visitor page logic
assets/js/admin.js      Admin panel logic
assets/img/             Images (AI placeholders until real work is uploaded)
supabase/schema.sql     Tables, policies, storage bucket — run once
supabase/seed.sql       Optional starting content — run after schema.sql
```

## Features

- Language toggle (عربي / EN) with full RTL/LTR switch
- Theme toggle (light / dark), colors inspired by the brand references
- Animated blob hero, floating icons, scroll-reveal, marquee strip
- Services section: 7 categories, each expandable to show its full service list
- Portfolio grid with category filters
- Contact form that stores messages in Supabase (readable in the admin panel)
- Admin panel edits: hero, about, services, portfolio (with image upload),
  contact info, socials, and theme colors — no code needed

## Supabase setup

1. Create a free project at https://supabase.com
2. In the SQL Editor, run `supabase/schema.sql`, then (optionally) `supabase/seed.sql`
3. Copy Project URL + anon public key (Project Settings -> API) into
   `assets/js/config.js`
4. Create the admin user: Authentication -> Users -> Add user, with email
   `<username>@mf-portfolio.local` and the chosen password (see config.js).
   The admin panel maps the username to that email automatically.

## Deploy

Any static host works: GitHub Pages, Vercel, Netlify, or Supabase Storage hosting.
For GitHub Pages: push this repo, then Settings -> Pages -> deploy from `main`.
