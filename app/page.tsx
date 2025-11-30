'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import PointsCalculator from '@/components/PointsCalculator';
import SchoolResults from '@/components/SchoolResults';
import { parseCSV, loadCSV, type SchoolData, type ParsedProfile } from '@/utils/csvParser';
import { GraduationCap, Loader2, Share2, Check } from 'lucide-react';
import type { CalculatorInput, Grade } from '@/utils/pointsCalculator';

export default function Home() {
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [profiles, setProfiles] = useState<ParsedProfile[]>([]);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState<boolean>(false);
  const pointsUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Funkcje do serializacji/deserializacji CalculatorInput
  const serializeCalculatorInput = (input: CalculatorInput) => {
    const grades = `polish=${input.grades.polish}|math=${input.grades.math}|foreignLanguage=${input.grades.foreignLanguage}|additionalSubject=${input.grades.additionalSubject}`;
    const exam = `polish=${input.examResults.polish}|math=${input.examResults.math}|foreignLanguage=${input.examResults.foreignLanguage}`;
    const additional = `redRibbon=${input.additionalPoints.redRibbon ? '1' : '0'}|volunteer=${input.additionalPoints.volunteer ? '1' : '0'}|achievements=${input.additionalPoints.achievements}`;
    return {
      grades: encodeURIComponent(grades),
      exam: encodeURIComponent(exam),
      additional: encodeURIComponent(additional),
    };
  };

  const deserializeCalculatorInput = (gradesParam: string | null, examParam: string | null, additionalParam: string | null): CalculatorInput | null => {
    try {
      const defaultInput: CalculatorInput = {
        grades: {
          polish: 'Bardzo dobry',
          math: 'Bardzo dobry',
          foreignLanguage: 'Bardzo dobry',
          additionalSubject: 'Bardzo dobry',
        },
        examResults: {
          polish: 80,
          math: 80,
          foreignLanguage: 80,
        },
        additionalPoints: {
          redRibbon: false,
          volunteer: false,
          achievements: 0,
        },
      };

      if (!gradesParam || !examParam || !additionalParam) {
        return null;
      }

      const grades: Partial<CalculatorInput['grades']> = {};
      decodeURIComponent(gradesParam).split('|').forEach((item) => {
        const [key, value] = item.split('=');
        if (key && value && (key === 'polish' || key === 'math' || key === 'foreignLanguage' || key === 'additionalSubject')) {
          grades[key] = value as Grade;
        }
      });

      const exam: Partial<CalculatorInput['examResults']> = {};
      decodeURIComponent(examParam).split('|').forEach((item) => {
        const [key, value] = item.split('=');
        if (key && value && (key === 'polish' || key === 'math' || key === 'foreignLanguage')) {
          const numValue = parseInt(value, 10);
          if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
            exam[key] = numValue;
          }
        }
      });

      const additional: Partial<CalculatorInput['additionalPoints']> = {};
      decodeURIComponent(additionalParam).split('|').forEach((item) => {
        const [key, value] = item.split('=');
        if (key && value) {
          if (key === 'achievements') {
            const numValue = parseInt(value, 10);
            if (!isNaN(numValue) && numValue >= 0 && numValue <= 18) {
              additional[key] = numValue;
            }
          } else if (key === 'redRibbon' || key === 'volunteer') {
            additional[key] = value === '1';
          }
        }
      });

      return {
        grades: { ...defaultInput.grades, ...grades },
        examResults: { ...defaultInput.examResults, ...exam },
        additionalPoints: { ...defaultInput.additionalPoints, ...additional },
      };
    } catch (err) {
      console.error('Błąd deserializacji kalkulatora:', err);
      return null;
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Next.js automatycznie obsługuje basePath dla plików w public/
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

  // Funkcja do aktualizacji URL
  const updateURL = (params: {
    profile?: string;
    schools?: string[];
    points?: number;
    calculatorInput?: CalculatorInput;
  }) => {
    const newParams = new URLSearchParams(searchParams.toString());
    
    if (params.profile !== undefined) {
      if (params.profile === 'all' || !params.profile) {
        newParams.delete('profile');
      } else {
        newParams.set('profile', encodeURIComponent(params.profile));
      }
    }
    
    if (params.schools !== undefined) {
      if (params.schools.length === 0) {
        newParams.delete('schools');
      } else {
        // Koduj każdą szkołę osobno
        const encodedSchools = params.schools.map(school => encodeURIComponent(school));
        newParams.set('schools', encodedSchools.join(','));
      }
    }
    
    if (params.points !== undefined && params.points > 0) {
      newParams.set('points', params.points.toFixed(2));
    } else {
      newParams.delete('points');
    }

    if (params.calculatorInput !== undefined) {
      const grades = `polish=${params.calculatorInput.grades.polish}|math=${params.calculatorInput.grades.math}|foreignLanguage=${params.calculatorInput.grades.foreignLanguage}|additionalSubject=${params.calculatorInput.grades.additionalSubject}`;
      const exam = `polish=${params.calculatorInput.examResults.polish}|math=${params.calculatorInput.examResults.math}|foreignLanguage=${params.calculatorInput.examResults.foreignLanguage}`;
      const additional = `redRibbon=${params.calculatorInput.additionalPoints.redRibbon ? '1' : '0'}|volunteer=${params.calculatorInput.additionalPoints.volunteer ? '1' : '0'}|achievements=${params.calculatorInput.additionalPoints.achievements}`;
      
      newParams.set('grades', encodeURIComponent(grades));
      newParams.set('exam', encodeURIComponent(exam));
      newParams.set('additional', encodeURIComponent(additional));
    }
    
    const newURL = `${pathname}${newParams.toString() ? `?${newParams.toString()}` : ''}`;
    router.replace(newURL, { scroll: false });
  };

  // Funkcja do udostępniania linku
  const handleShare = async () => {
    const params = new URLSearchParams(searchParams.toString());
    const shareURL = `${window.location.origin}${pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    
    try {
      await navigator.clipboard.writeText(shareURL);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch (err) {
      console.error('Błąd kopiowania do schowka:', err);
    }
  };

  // Załaduj ustawienia kalkulatora z URL przy starcie
  const [initialCalculatorInput, setInitialCalculatorInput] = useState<CalculatorInput | null>(null);
  
  useEffect(() => {
    const gradesParam = searchParams.get('grades');
    const examParam = searchParams.get('exam');
    const additionalParam = searchParams.get('additional');
    
    const loadedInput = deserializeCalculatorInput(gradesParam, examParam, additionalParam);
    if (loadedInput) {
      setInitialCalculatorInput(loadedInput);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Tylko przy pierwszym renderze

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
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-primary-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Kalkulator Punktów Rekrutacyjnych
                </h1>
                <p className="text-sm text-gray-600">Licea w Krakowie - Rok szkolny 2026/2027 na podstawie danych z 2025/2026</p>
              </div>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              {shareCopied ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>Skopiowano!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-5 h-5" />
                  <span>Udostępnij</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Lewa kolumna - Kalkulator */}
          <div className="lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:sticky lg:top-8">
            <PointsCalculator 
              initialInput={initialCalculatorInput}
              onInputChange={(input) => {
                // Debounce aktualizacji URL dla kalkulatora
                if (pointsUpdateTimeoutRef.current) {
                  clearTimeout(pointsUpdateTimeoutRef.current);
                }
                pointsUpdateTimeoutRef.current = setTimeout(() => {
                  updateURL({ calculatorInput: input });
                }, 500);
              }}
              onPointsChange={(points) => {
                setUserPoints(points);
              }} 
            />
          </div>

          {/* Prawa kolumna - Wyniki */}
          <div className="lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
            <SchoolResults 
              schools={schools} 
              profiles={profiles} 
              userPoints={userPoints}
              searchParams={searchParams}
              onUpdateURL={updateURL}
            />
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

