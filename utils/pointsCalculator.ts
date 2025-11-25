/**
 * Kalkulator punktów rekrutacyjnych do liceów (2025)
 * Maksymalna liczba punktów: 200
 */

export type Grade = 'Celujący' | 'Bardzo dobry' | 'Dobry' | 'Dostateczny' | 'Dopuszczający';

export const GRADE_POINTS: Record<Grade, number> = {
  'Celujący': 18,
  'Bardzo dobry': 17,
  'Dobry': 14,
  'Dostateczny': 8,
  'Dopuszczający': 2,
};

export interface ExamResults {
  polish: number; // 0-100%
  math: number; // 0-100%
  foreignLanguage: number; // 0-100%
}

export interface AdditionalPoints {
  redRibbon: boolean; // Świadectwo z czerwonym paskiem (+7)
  volunteer: boolean; // Wolontariat (+3)
  achievements: number; // Konkursy/Osiągnięcia (max 18)
}

export interface CalculatorInput {
  grades: {
    polish: Grade;
    math: Grade;
    foreignLanguage: Grade;
    additionalSubject: Grade;
  };
  examResults: ExamResults;
  additionalPoints: AdditionalPoints;
}

/**
 * Oblicza punkty z ocen (maksymalnie 72 pkt)
 */
export function calculateGradePoints(grades: CalculatorInput['grades']): number {
  const points = 
    GRADE_POINTS[grades.polish] +
    GRADE_POINTS[grades.math] +
    GRADE_POINTS[grades.foreignLanguage] +
    GRADE_POINTS[grades.additionalSubject];
  
  return Math.min(points, 72); // Maksymalnie 72 pkt
}

/**
 * Oblicza punkty z egzaminu ósmoklasisty (maksymalnie 100 pkt)
 */
export function calculateExamPoints(examResults: ExamResults): number {
  const polishPoints = examResults.polish * 0.35;
  const mathPoints = examResults.math * 0.35;
  const foreignLanguagePoints = examResults.foreignLanguage * 0.30;
  
  return Math.min(polishPoints + mathPoints + foreignLanguagePoints, 100);
}

/**
 * Oblicza punkty dodatkowe (maksymalnie 28 pkt)
 */
export function calculateAdditionalPoints(additional: AdditionalPoints): number {
  let points = 0;
  
  if (additional.redRibbon) points += 7;
  if (additional.volunteer) points += 3;
  points += Math.min(additional.achievements, 18);
  
  return Math.min(points, 28);
}

/**
 * Oblicza całkowitą liczbę punktów rekrutacyjnych
 */
export function calculateTotalPoints(input: CalculatorInput): number {
  const gradePoints = calculateGradePoints(input.grades);
  const examPoints = calculateExamPoints(input.examResults);
  const additionalPoints = calculateAdditionalPoints(input.additionalPoints);
  
  return gradePoints + examPoints + additionalPoints;
}

