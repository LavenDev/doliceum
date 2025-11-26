# Instrukcja wdrożenia na GitHub Pages

## Krok 1: Utwórz repozytorium na GitHubie

1. Przejdź na https://github.com/new
2. Nazwij repozytorium (np. `licea-webscraper` lub `kalkulator-licea-krakow`)
3. **NIE** inicjalizuj z README, .gitignore lub licencją (już mamy te pliki)
4. Kliknij "Create repository"

## Krok 2: Połącz lokalne repozytorium z GitHubem

W terminalu wykonaj następujące polecenia (zamień `YOUR_USERNAME` i `YOUR_REPO_NAME` na swoje dane):

```bash
# Dodaj remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Zmień nazwę brancha na main (jeśli jeszcze nie jest)
git branch -M main

# Wyślij kod na GitHub
git push -u origin main
```

## Krok 3: Skonfiguruj GitHub Pages

1. Przejdź do swojego repozytorium na GitHubie
2. Kliknij **Settings** (Ustawienia)
3. W menu po lewej stronie znajdź **Pages**
4. W sekcji **Source** wybierz:
   - **Source**: `GitHub Actions`
5. Zapisz zmiany

## Krok 4: Zaktualizuj basePath (jeśli nazwa repo jest inna)

Jeśli Twoje repozytorium ma inną nazwę niż `licea-webscraper`, musisz zaktualizować `next.config.js`:

```javascript
const repoName = 'TWOJA_NAZWA_REPO' // zmień tutaj
```

Lub możesz ustawić zmienną środowiskową w GitHub Actions (w pliku `.github/workflows/deploy.yml`):

```yaml
- name: Build
  run: npm run build
  env:
    NODE_ENV: production
    GITHUB_REPOSITORY: ${{ github.repository }}
```

## Krok 5: Automatyczne wdrożenie

Po wykonaniu powyższych kroków, każdy push do brancha `main` automatycznie:
1. Zbuduje aplikację
2. Wdroży ją na GitHub Pages

Aplikacja będzie dostępna pod adresem:
`https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

## Rozwiązywanie problemów

### Jeśli aplikacja nie działa po wdrożeniu:

1. Sprawdź czy `basePath` w `next.config.js` odpowiada nazwie repozytorium
2. Sprawdź czy plik CSV jest w folderze `public/`
3. Sprawdź logi w zakładce **Actions** na GitHubie

### Jeśli chcesz testować lokalnie z basePath:

```bash
# Ustaw zmienną środowiskową
export NODE_ENV=production
export GITHUB_REPOSITORY=YOUR_USERNAME/YOUR_REPO_NAME

# Zbuduj i uruchom
npm run build
npx serve out
```

## Aktualizacja danych CSV

Jeśli chcesz zaktualizować dane CSV:

1. Zaktualizuj plik `public/progi_licea_krakow_2025_2026.csv`
2. Wykonaj commit i push:
   ```bash
   git add public/progi_licea_krakow_2025_2026.csv
   git commit -m "Aktualizacja danych CSV"
   git push
   ```



