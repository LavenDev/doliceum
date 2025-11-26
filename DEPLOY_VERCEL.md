# 🚀 Wdrożenie na Vercel (REKOMENDOWANE)

## Dlaczego Vercel?

✅ **Najlepsze dla Next.js** - stworzone przez twórców Next.js  
✅ **Darmowe** - hojny darmowy tier  
✅ **Automatyczne wdrożenia** - każdy push do GitHub = nowa wersja  
✅ **Błyskawiczne** - CDN na całym świecie  
✅ **Zero konfiguracji** - działa od razu  
✅ **Własna domena** - możesz dodać custom domain  
✅ **Preview deployments** - każdy PR dostaje własny URL  

## Szybkie wdrożenie (2 minuty)

### Metoda 1: Przez GitHub (NAJŁATWIEJSZA)

1. **Zaloguj się na Vercel:**
   - Przejdź na: https://vercel.com
   - Kliknij **Sign Up** i zaloguj się przez GitHub

2. **Importuj projekt:**
   - Kliknij **Add New Project**
   - Wybierz swoje repozytorium `doliceum` (lub jakąkolwiek nazwę masz)
   - Vercel automatycznie wykryje Next.js

3. **Konfiguracja:**
   - **Framework Preset**: Next.js (powinno być automatycznie)
   - **Root Directory**: `./` (domyślnie)
   - **Build Command**: `npm run build` (domyślnie)
   - **Output Directory**: `.next` (domyślnie dla Next.js)
   - **Install Command**: `npm install` (domyślnie)

4. **Deploy:**
   - Kliknij **Deploy**
   - Gotowe! 🎉

### Metoda 2: Przez Vercel CLI

```bash
# Zainstaluj Vercel CLI
npm i -g vercel

# Zaloguj się
vercel login

# Wdróż
vercel

# Dla produkcji
vercel --prod
```

## Co dalej?

Po wdrożeniu otrzymasz:
- **URL produkcyjny**: `https://doliceum.vercel.app` (lub podobny)
- **Automatyczne wdrożenia** przy każdym pushu do `main`
- **Preview URLs** dla każdego Pull Request

## Aktualizacja aplikacji

Po prostu pushuj zmiany do GitHub:
```bash
git add .
git commit -m "Aktualizacja"
git push
```

Vercel automatycznie wdroży nową wersję!

## Dodanie własnej domeny

1. Vercel Dashboard → Twój projekt → **Settings** → **Domains**
2. Dodaj swoją domenę
3. Postępuj zgodnie z instrukcjami DNS

---

## Alternatywy (jeśli nie Vercel)

### Netlify
- Podobnie łatwe jak Vercel
- https://netlify.com
- Również automatyczne wdrożenia z GitHub

### Cloudflare Pages
- Bardzo szybkie (Cloudflare CDN)
- https://pages.cloudflare.com
- Darmowe, bez limitu bandwidth

### Render
- https://render.com
- Darmowy tier dostępny
- Automatyczne wdrożenia

### GitHub Pages (już skonfigurowane)
- Działa, ale wymaga statycznego eksportu
- Wolniejsze niż Vercel/Netlify
- Instrukcje w `DEPLOY.md`

