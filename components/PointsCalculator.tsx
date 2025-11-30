'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  calculateTotalPoints,
  calculateGradePoints,
  calculateExamPoints,
  calculateAdditionalPoints,
  type CalculatorInput,
  type Grade,
} from '@/utils/pointsCalculator';
import { Calculator, BookOpen, Award, Plus } from 'lucide-react';

interface PointsCalculatorProps {
  initialInput?: CalculatorInput | null;
  onInputChange?: (input: CalculatorInput) => void;
  onPointsChange: (points: number) => void;
}

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

export default function PointsCalculator({ initialInput, onInputChange, onPointsChange }: PointsCalculatorProps) {
  const [input, setInput] = useState<CalculatorInput>(initialInput || defaultInput);

  // Zaktualizuj input gdy initialInput się zmieni (np. z URL)
  useEffect(() => {
    if (initialInput) {
      setInput(initialInput);
    }
  }, [initialInput]);

  const totalPoints = useMemo(() => {
    const points = calculateTotalPoints(input);
    onPointsChange(points);
    return points;
  }, [input, onPointsChange]);

  const gradePoints = useMemo(() => calculateGradePoints(input.grades), [input.grades]);
  const examPoints = useMemo(() => calculateExamPoints(input.examResults), [input.examResults]);
  const additionalPoints = useMemo(
    () => calculateAdditionalPoints(input.additionalPoints),
    [input.additionalPoints]
  );

  const updateInput = (newInput: CalculatorInput) => {
    setInput(newInput);
    if (onInputChange) {
      onInputChange(newInput);
    }
  };

  const updateGrade = (subject: keyof CalculatorInput['grades'], grade: Grade) => {
    const newInput = {
      ...input,
      grades: { ...input.grades, [subject]: grade },
    };
    updateInput(newInput);
  };

  const updateExamResult = (subject: keyof CalculatorInput['examResults'], value: number) => {
    const newInput = {
      ...input,
      examResults: { ...input.examResults, [subject]: Math.max(0, Math.min(100, value)) },
    };
    updateInput(newInput);
  };

  const updateAdditionalPoints = (
    field: keyof CalculatorInput['additionalPoints'],
    value: boolean | number
  ) => {
    const newInput = {
      ...input,
      additionalPoints: { ...input.additionalPoints, [field]: value },
    };
    updateInput(newInput);
  };

  const GRADE_OPTIONS: Grade[] = ['Celujący', 'Bardzo dobry', 'Dobry', 'Dostateczny', 'Dopuszczający'];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-6 h-6 text-primary-600" />
        <h2 className="text-2xl font-bold text-gray-800">Kalkulator Punktów</h2>
      </div>

      {/* Oceny */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-700">
          <BookOpen className="w-5 h-5" />
          <span>A. Oceny (maksymalnie 72 pkt)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(['polish', 'math', 'foreignLanguage', 'additionalSubject'] as const).map((subject) => (
            <div key={subject} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {subject === 'polish' && 'Język polski'}
                {subject === 'math' && 'Matematyka'}
                {subject === 'foreignLanguage' && 'Język obcy'}
                {subject === 'additionalSubject' && 'Przedmiot dodatkowy'}
              </label>
              <select
                value={input.grades[subject]}
                onChange={(e) => updateGrade(subject, e.target.value as Grade)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {GRADE_OPTIONS.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          Punkty z ocen: <span className="font-semibold">{gradePoints} / 72</span>
        </div>
      </section>

      {/* Egzamin ósmoklasisty */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-700">
          <Award className="w-5 h-5" />
          <span>B. Egzamin ósmoklasisty (maksymalnie 100 pkt)</span>
        </div>
        <div className="space-y-4">
          {(['polish', 'math', 'foreignLanguage'] as const).map((subject) => (
            <div key={subject} className="space-y-2">
              <div className="flex justify-between text-sm">
                <label className="font-medium text-gray-700">
                  {subject === 'polish' && 'Język polski'}
                  {subject === 'math' && 'Matematyka'}
                  {subject === 'foreignLanguage' && 'Język obcy'}
                </label>
                <span className="text-gray-600">
                  {input.examResults[subject]}%{' '}
                  {subject === 'polish' && `(${(input.examResults[subject] * 0.35).toFixed(2)} pkt)`}
                  {subject === 'math' && `(${(input.examResults[subject] * 0.35).toFixed(2)} pkt)`}
                  {subject === 'foreignLanguage' && `(${(input.examResults[subject] * 0.30).toFixed(2)} pkt)`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={input.examResults[subject]}
                onChange={(e) => updateExamResult(subject, parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>
          ))}
        </div>
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          Punkty z egzaminu: <span className="font-semibold">{examPoints.toFixed(2)} / 100</span>
        </div>
      </section>

      {/* Punkty dodatkowe */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-700">
          <Plus className="w-5 h-5" />
          <span>C. Punkty dodatkowe (maksymalnie 28 pkt)</span>
        </div>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={input.additionalPoints.redRibbon}
              onChange={(e) => updateAdditionalPoints('redRibbon', e.target.checked)}
              className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-gray-700">Świadectwo z czerwonym paskiem (+7 pkt)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={input.additionalPoints.volunteer}
              onChange={(e) => updateAdditionalPoints('volunteer', e.target.checked)}
              className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-gray-700">Wolontariat (+3 pkt)</span>
          </label>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Konkursy/Osiągnięcia (maksymalnie 18 pkt)
            </label>
            <input
              type="number"
              min="0"
              max="18"
              value={input.additionalPoints.achievements}
              onChange={(e) =>
                updateAdditionalPoints('achievements', Math.max(0, Math.min(18, parseInt(e.target.value) || 0)))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          Punkty dodatkowe: <span className="font-semibold">{additionalPoints} / 28</span>
        </div>
      </section>

      {/* Podsumowanie */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-4 rounded-lg">
        <div className="text-sm opacity-90">Twój wynik</div>
        <div className="text-3xl font-bold">{totalPoints.toFixed(2)} / 200 pkt</div>
      </div>
    </div>
  );
}




