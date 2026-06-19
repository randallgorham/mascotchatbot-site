# MascotChatbot — website (Next.js)

Black-and-white marketing site for mascotchatbot.com. Next.js 14 (App Router) + Tailwind CSS.

## Run locally
```bash
npm install
npm run dev        # http://localhost:3000
```

## Deploy to Vercel (fastest)
1. Push this folder to a GitHub repo.
2. Go to vercel.com → New Project → import the repo (Vercel auto-detects Next.js).
3. Deploy. Then add your domain **mascotchatbot.com** under Project → Settings → Domains.

Or with the CLI:
```bash
npm i -g vercel
vercel            # follow prompts
vercel --prod
```

## Where to edit content
- `app/page.tsx` — all homepage copy and the pricing/demos/steps arrays (top of file).
- `components/MascotMock.tsx` — the animated placeholder mascot + the talking lines.
- `tailwind.config.ts` — colors and animations.

## Next steps
- Swap the placeholder mascot circles in the Demos section for real **Rive** characters once rigged.
- Wire the email form to your CRM / a form endpoint (Formspree, Resend, or your backend).
- Keep the marketing site separate from the bot platform/app (build that as its own Next.js app later).
