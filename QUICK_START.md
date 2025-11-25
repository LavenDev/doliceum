# Szybki start - GitHub Pages

## 1. Utwórz repozytorium na GitHubie

```bash
# Na GitHubie: https://github.com/new
# Nazwa: licea-webscraper (lub inna)
# Public/Private - wybierz według uznania
```

## 2. Połącz z GitHubem

```bash
# Zastąp YOUR_USERNAME i YOUR_REPO_NAME
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

## 3. Włącz GitHub Pages

1. GitHub → Twoje repo → **Settings**
2. **Pages** (w menu po lewej)
3. **Source**: Wybierz **GitHub Actions**
4. Zapisz

## 4. Gotowe! 🎉

Aplikacja będzie dostępna pod:
`https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

Wdrożenie nastąpi automatycznie po każdym pushu do `main`.

---

**Uwaga:** Jeśli nazwa repozytorium jest inna niż `licea-webscraper`, zaktualizuj `next.config.js`:

```javascript
const repoName = 'TWOJA_NAZWA_REPO'
```

Lub ustaw zmienną `GITHUB_REPOSITORY` w GitHub Actions (już skonfigurowane).

