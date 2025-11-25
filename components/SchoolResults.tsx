'use client';

import { useMemo } from 'react';
import { SchoolData, ParsedProfile } from '@/utils/csvParser';
import { CheckCircle2, XCircle, DoorOpen, Filter } from 'lucide-react';
import { useState } from 'react';

interface SchoolResultsProps {
  schools: SchoolData[];
  profiles: ParsedProfile[];
  userPoints: number;
}

interface SchoolGroup {
  school: string;
  classes: SchoolData[];
  minThreshold: number;
  maxThreshold: number;
}

export default function SchoolResults({ schools, profiles, userPoints }: SchoolResultsProps) {
  const [selectedProfile, setSelectedProfile] = useState<string>('all');

  // Grupuj szkoły i klasy
  const schoolGroups = useMemo(() => {
    const groups = new Map<string, SchoolGroup>();

    schools.forEach((schoolData) => {
      // Filtruj po profilu jeśli wybrano
      if (selectedProfile !== 'all' && schoolData.profile !== selectedProfile) {
        return;
      }

      if (!groups.has(schoolData.school)) {
        groups.set(schoolData.school, {
          school: schoolData.school,
          classes: [],
          minThreshold: schoolData.threshold,
          maxThreshold: schoolData.threshold,
        });
      }

      const group = groups.get(schoolData.school)!;
      group.classes.push(schoolData);
      group.minThreshold = Math.min(group.minThreshold, schoolData.threshold);
      group.maxThreshold = Math.max(group.maxThreshold, schoolData.threshold);
    });

    return Array.from(groups.values());
  }, [schools, selectedProfile]);

  // Sortuj szkoły: najpierw te, do których użytkownik się dostaje (najmniejsza różnica), potem te z najmniejszą różnicą
  const sortedSchools = useMemo(() => {
    return schoolGroups
      .map((group) => {
        const accessibleClasses = group.classes.filter((c) => userPoints >= c.threshold);
        const inaccessibleClasses = group.classes.filter((c) => userPoints < c.threshold);

        const minAccessibleDiff =
          accessibleClasses.length > 0
            ? Math.min(...accessibleClasses.map((c) => userPoints - c.threshold))
            : Infinity;
        const minInaccessibleDiff =
          inaccessibleClasses.length > 0
            ? Math.min(...inaccessibleClasses.map((c) => c.threshold - userPoints))
            : Infinity;

        return {
          ...group,
          accessibleClasses,
          inaccessibleClasses,
          minAccessibleDiff,
          minInaccessibleDiff,
        };
      })
      .sort((a, b) => {
        // Najpierw szkoły z dostępnymi klasami
        if (a.accessibleClasses.length > 0 && b.accessibleClasses.length === 0) return -1;
        if (a.accessibleClasses.length === 0 && b.accessibleClasses.length > 0) return 1;

        // Wśród dostępnych: sortuj po najmniejszej różnicy (największy zapas)
        if (a.accessibleClasses.length > 0 && b.accessibleClasses.length > 0) {
          return a.minAccessibleDiff - b.minAccessibleDiff;
        }

        // Wśród niedostępnych: sortuj po najmniejszej różnicy (najbliżej progu)
        return a.minInaccessibleDiff - b.minInaccessibleDiff;
      });
  }, [schoolGroups, userPoints]);

  const accessibleCount = useMemo(() => {
    return sortedSchools.reduce((sum, group) => sum + group.accessibleClasses.length, 0);
  }, [sortedSchools]);

  return (
    <div className="space-y-6">
      {/* Nagłówek z wynikiem */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-sm text-gray-600 mb-2">Twój wynik rekrutacyjny</div>
        <div className="text-4xl font-bold text-gray-800 mb-4">{userPoints.toFixed(2)} pkt</div>
        <div className="text-lg text-primary-600 font-semibold">
          {accessibleCount > 0
            ? `Masz szansę w ${accessibleCount} ${accessibleCount === 1 ? 'klasie' : 'klasach'}!`
            : 'Sprawdź, ile punktów brakuje do wybranych szkół'}
        </div>
      </div>

      {/* Filtr profili */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-5 h-5 text-gray-600" />
          <label className="text-sm font-semibold text-gray-700">Filtruj po profilu</label>
        </div>
        <select
          value={selectedProfile}
          onChange={(e) => setSelectedProfile(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="all">Wszystkie profile</option>
          {profiles.map((profile) => (
            <option key={profile.name} value={profile.name}>
              {profile.original}
            </option>
          ))}
        </select>
      </div>

      {/* Lista szkół */}
      <div className="space-y-4">
        {sortedSchools.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center text-gray-500">
            Brak szkół spełniających wybrane kryteria
          </div>
        ) : (
          sortedSchools.map((group) => (
            <SchoolCard
              key={group.school}
              group={group}
              userPoints={userPoints}
            />
          ))
        )}
      </div>
    </div>
  );
}

function SchoolCard({
  group,
  userPoints,
}: {
  group: SchoolGroup & {
    accessibleClasses: SchoolData[];
    inaccessibleClasses: SchoolData[];
  };
  userPoints: number;
}) {
  const allClasses = [...group.accessibleClasses, ...group.inaccessibleClasses];

  return (
    <div
      className={`bg-white rounded-xl shadow-lg overflow-hidden border-2 ${
        group.accessibleClasses.length > 0
          ? 'border-primary-500'
          : 'border-gray-200'
      }`}
    >
      <div className="p-5 border-b border-gray-100">
        <h3 className="text-xl font-bold text-gray-800">{group.school}</h3>
        <div className="text-sm text-gray-600 mt-1">
          Progi: {group.minThreshold.toFixed(2)} - {group.maxThreshold.toFixed(2)} pkt
        </div>
      </div>

      <div className="p-5 space-y-3">
        {allClasses.map((classData) => {
          const isAccessible = userPoints >= classData.threshold;
          const difference = Math.abs(userPoints - classData.threshold);
          const progress = Math.min((userPoints / classData.threshold) * 100, 100);

          return (
            <div
              key={classData.className}
              className={`p-4 rounded-lg border-2 ${
                isAccessible
                  ? 'border-primary-200 bg-primary-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{classData.className}</div>
                  <div className="text-sm text-gray-600">Próg: {classData.threshold.toFixed(2)} pkt</div>
                </div>
                <div className="ml-4">
                  {isAccessible ? (
                    <div className="flex items-center gap-2 text-primary-600">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="text-sm font-semibold">Masz szansę!</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600">
                      <XCircle className="w-5 h-5" />
                      <span className="text-sm font-semibold">Brakuje {difference.toFixed(2)} pkt</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Twój wynik: {userPoints.toFixed(2)} pkt</span>
                  <span>Próg: {classData.threshold.toFixed(2)} pkt</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isAccessible ? 'bg-primary-500' : 'bg-red-400'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {isAccessible && (
                  <div className="text-xs text-primary-600 mt-1 font-medium">
                    Zapas: +{difference.toFixed(2)} pkt
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

