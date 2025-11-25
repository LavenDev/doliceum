'use client';

import { useState, useEffect } from 'react';
import PointsCalculator from '@/components/PointsCalculator';
import SchoolResults from '@/components/SchoolResults';
import { parseCSV, loadCSV, type SchoolData, type ParsedProfile } from '@/utils/csvParser';
import { GraduationCap, Loader2 } from 'lucide-react';

export default function Home() {
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [profiles, setProfiles] = useState<ParsedProfile[]>([]);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const csvContent = await loadCSV('/progi_licea_krakow_2025_2026.csv');
        const { schools: parsedSchools, profiles: parsedProfiles } = await parseCSV(csvContent);
        setSchools(parsedSchools);
        setProfiles(parsedProfiles);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas ładowania danych');
        console.error('Błąd ładowania CSV:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Ładowanie danych...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Błąd ładowania danych</h2>
          <p className="text-gray-600">{error}</p>
          <p className="text-sm text-gray-500 mt-4">
            Upewnij się, że plik CSV znajduje się w folderze public
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-primary-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Kalkulator Punktów Rekrutacyjnych
              </h1>
              <p className="text-sm text-gray-600">Licea w Krakowie - Rok szkolny 2025/2026</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Lewa kolumna - Kalkulator */}
          <div className="lg:sticky lg:top-8 lg:h-fit">
            <PointsCalculator onPointsChange={setUserPoints} />
          </div>

          {/* Prawa kolumna - Wyniki */}
          <div>
            <SchoolResults schools={schools} profiles={profiles} userPoints={userPoints} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600">
            Dane pochodzą z portalu{' '}
            <a
              href="https://www.otouczelnie.pl"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 underline"
            >
              otouczelnie.pl
            </a>
            {' '}• Kalkulator zgodny z zasadami rekrutacji na rok 2025/2026
          </p>
        </div>
      </footer>
    </div>
  );
}

