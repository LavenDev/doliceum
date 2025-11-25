# Kalkulator Punktów Rekrutacyjnych - Licea Kraków 2025/2026

Nowoczesna aplikacja webowa do obliczania punktów rekrutacyjnych i sprawdzania dostępności liceów w Krakowie.

## 🚀 Funkcje

- **Kalkulator punktów rekrutacyjnych** zgodny z zasadami 2025
  - Oceny z 4 przedmiotów (maksymalnie 72 pkt)
  - Wyniki egzaminu ósmoklasisty (maksymalnie 100 pkt)
  - Punkty dodatkowe (maksymalnie 28 pkt)
- **Filtrowanie szkół** po profilach klas
- **Wizualizacja wyników** z kolorowym oznaczeniem dostępności
- **Progress bar** pokazujący bliskość progu punktowego
- **Responsywny design** - działa na desktopie i mobile

## 📋 Wymagania

- Node.js 18+ 
- npm lub yarn

## 🛠️ Instalacja

1. Zainstaluj zależności:
```bash
npm install
```

2. Uruchom serwer deweloperski:
```bash
npm run dev
```

3. Otwórz [http://localhost:3000](http://localhost:3000) w przeglądarce

## 📦 Struktura projektu

```
├── app/
│   ├── layout.tsx          # Główny layout aplikacji
│   ├── page.tsx            # Strona główna
│   └── globals.css         # Globalnyle globalne
├── components/
│   ├── PointsCalculator.tsx    # Komponent kalkulatora
│   └── SchoolResults.tsx       # Komponent wyników
├── utils/
│   ├── csvParser.ts            # Parser CSV i wyciąganie profili
│   └── pointsCalculator.ts     # Logika obliczania punktów
├── public/
│   └── progi_licea_krakow_2025_2026.csv  # Dane szkół
└── package.json
```

## 🎨 Technologie

- **Next.js 14** - Framework React
- **TypeScript** - Typowanie statyczne
- **Tailwind CSS** - Stylowanie
- **Lucide React** - Ikony
- **PapaParse** - Parsowanie CSV

## 📊 Zasady obliczania punktów (2025)

### Oceny (maksymalnie 72 pkt)
- Celujący: 18 pkt
- Bardzo dobry: 17 pkt
- Dobry: 14 pkt
- Dostateczny: 8 pkt
- Dopuszczający: 2 pkt

### Egzamin ósmoklasisty (maksymalnie 100 pkt)
- Język polski: wynik % × 0.35
- Matematyka: wynik % × 0.35
- Język obcy: wynik % × 0.30

### Punkty dodatkowe (maksymalnie 28 pkt)
- Świadectwo z czerwonym paskiem: +7 pkt
- Wolontariat: +3 pkt
- Konkursy/Osiągnięcia: maksymalnie 18 pkt

## 📝 Licencja

Dane pochodzą z portalu [otouczelnie.pl](https://www.otouczelnie.pl)

