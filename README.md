# 🎯 JE Electronics Roadmap

Junior Engineer (Electronics) exam ke liye ek modern, student-friendly study website. Hinglish me, bina kisi framework ke (plain HTML/CSS/JS).

## ✨ Features
- **Overview:** pichle 5 papers ke hisaab se subject-wise weightage aur "pehle yeh 15" topics
- **Syllabus tracker:** har subtopic bullets/numbering me, progress tick (Padh liya → PYQ kiye → Pakka), tier filter
- **Notes:** subject-wise PDF notes, dekho ya download karo
- **Numericals + Formula sheet:** exam se pehle quick revision
- **Planner:** exam date daalo, subject ka time weightage ke hisaab se baant diya jata hai
- **Journey + Mock log:** mock scores ka graph aur negative marking ka hisaab
- **PDF download:** poora roadmap ya sirf formula sheet (📥 PDF button)
- **Google login:** login karne par progress, mock scores aur planner account me sync hote hain (phone aur laptop pe same)
- Dark / light theme

## 🔐 Login aur Notes
- Koi bhi Google se login karke apna progress sync kar sakta hai. Har user ka data sirf usi ko dikhta hai.
- Notes ki PDFs sabko dikhti hain, par **upload sirf owner kar sakta hai** (website se, subject kholke).

## 🗂️ Repo me kya hai
| File | Kaam |
|---|---|
| `index.html` | poori website (code + syllabus data) |
| `.nojekyll` | GitHub Pages ke liye |
| `README.md` | ye file |

## ⚙️ Backend
Login, sync aur PDF storage [Supabase](https://supabase.com) (free plan) se chalta hai. `index.html` me sirf Supabase ka public URL aur publishable key hai, koi secret key nahi. Data ki suraksha database ke Row Level Security rules se hoti hai.

> Free plan me hafte bhar koi site na khole to Supabase project pause ho jata hai. Dashboard se ek click me wapas chalu hota hai.
