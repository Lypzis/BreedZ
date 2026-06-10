# BreedZ Secrets Hygiene Skill

## When To Use

Use this skill when handling `.env` files, Netlify environment variables, Firebase config, Firebase Admin credentials, Stripe secrets, webhook secrets, provider tokens, screenshots/logs that may contain secrets, or leaked credential cleanup.

## Rules

- Never commit `.env`, `.env.local`, service account JSON, Stripe secrets, webhook secrets, Netlify tokens, or private customer/provider data.
- Keep real values in local env files, Netlify environment variables, Firebase dashboards, Stripe dashboards, or provider consoles.
- Use safe placeholders in examples and documentation.
- Firebase client config can be public, but Firebase Admin credentials must stay server-side.
- Stripe secret keys and webhook secrets must stay server-side.
- Do not expose premium-entitlement trust through client-only code.
- If a credential is pasted into chat, logs, screenshots, docs, or committed files, recommend rotation.
- When adding a new environment variable, document the placeholder and the provider location without including the value.
- Netlify owns deployment for this project, so keep production build/runtime values in Netlify environment variables.
- Do not add Netlify deploy credentials to GitHub unless Netlify auto-deploy is intentionally disabled.

## Files To Check

- `.gitignore`
- `.env*`
- `.github/workflows`
- `netlify.toml`
- `netlify/functions`
- `src/services/firebase.js`
- `quasar.config.js`
- `README.md`
- `AGENTS.md`
- `.agents/skills`

## Useful Checks

```bash
git status --short --ignored .env .env.local
git ls-files .env .env.local
rg -n "sk_live|sk_test|whsec_|firebase-adminsdk|private_key|STRIPE_SECRET|WEBHOOK_SECRET|service_account" .
```

Be careful with `rg` output if it might print a real secret. Summarize findings without repeating sensitive values.
