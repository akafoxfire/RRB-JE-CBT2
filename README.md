# JE Roadmap + Google login + notes upload

## 1. Supabase (free)
1. supabase.com pe project banao. Project Settings > API se **Project URL** aur **anon public key** copy karo.
2. SQL Editor me `supabase.sql` paste karo. Pehle `OWNER@gmail.com` ko apne Google email se replace karo. Run karo.

## 2. Google login
1. console.cloud.google.com > APIs & Services > Credentials > Create OAuth client ID (Web application).
2. Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`
3. Client ID aur Secret ko Supabase > Authentication > Providers > Google me paste karo, enable karo.
4. Supabase > Authentication > URL Configuration: Site URL = apni GitHub Pages link (`https://username.github.io/repo/`), aur wahi Redirect URLs me bhi add karo.

## 3. index.html me 1 line badlo
`const SB_URL="",SB_KEY="",OWNER="";` me URL, anon key, aur apna Google email bharo.

## 4. GitHub Pages pe upload
index.html, .nojekyll repo me daalo. Phir site pe apne email se login karo: Notes tab me har subject me Upload dikhega. Dusre log login karke sirf progress/mocks sync kar sakte hain, upload nahi.
