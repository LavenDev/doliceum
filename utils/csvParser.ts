import Papa from 'papaparse';

export interface SchoolData {
  school: string;
  className: string;
  threshold: number;
  profile?: string; // Wyciągnięty profil z nawiasów
}

export interface ParsedProfile {
  name: string; // Znormalizowana nazwa profilu
  original: string; // Oryginalna nazwa z CSV
}

/**
 * Wyciąga profil z nazwy klasy (tekst w nawiasach)
 * Przykład: "Klasa 1A (mat-fiz-inf)" -> "mat-fiz-inf"
 */
export function extractProfile(className: string): string | null {
  const match = className.match(/\(([^)]+)\)/);
  return match ? match[1].trim() : null;
}

/**
 * Normalizuje nazwę profilu do unikalnej wartości
 * Usuwa spacje, zamienia na małe litery, sortuje części
 */
export function normalizeProfile(profile: string): string {
  return profile
    .toLowerCase()
    .replace(/\s+/g, '-')
    .split('-')
    .sort()
    .join('-');
}

/**
 * Parsuje plik CSV i zwraca dane szkół wraz z profilami
 */
export async function parseCSV(csvContent: string): Promise<{
  schools: SchoolData[];
  profiles: ParsedProfile[];
}> {
  return new Promise((resolve, reject) => {
    Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const schools: SchoolData[] = [];
        const profileMap = new Map<string, string>(); // normalized -> original

        results.data.forEach((row: any) => {
          const threshold = parseFloat(row['Próg punktowy']?.replace(',', '.') || '0');
          const className = row['Klasa'] || '';
          const school = row['Szkoła'] || '';
          
          if (!school || !className || isNaN(threshold)) {
            return;
          }

          const profileRaw = extractProfile(className);
          const profile = profileRaw ? normalizeProfile(profileRaw) : null;

          schools.push({
            school,
            className,
            threshold,
            profile: profile || undefined,
          });

          // Zbierz unikalne profile
          if (profile && profileRaw) {
            if (!profileMap.has(profile)) {
              profileMap.set(profile, profileRaw);
            }
          }
        });

        // Konwertuj mapę na tablicę profili
        const profiles: ParsedProfile[] = Array.from(profileMap.entries()).map(
          ([normalized, original]) => ({
            name: normalized,
            original: original,
          })
        );

        // Sortuj profile alfabetycznie
        profiles.sort((a, b) => a.original.localeCompare(b.original));

        resolve({ schools, profiles });
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

/**
 * Ładuje plik CSV z publicznego folderu
 */
export async function loadCSV(filePath: string): Promise<string> {
  const response = await fetch(filePath);
  if (!response.ok) {
    throw new Error(`Nie udało się załadować pliku CSV: ${response.statusText}`);
  }
  return response.text();
}

