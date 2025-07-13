export interface Quiz {
  id: string;
  questions: QuizQuestion[];
  creator: string;
}

export interface QuizQuestion {
  id: number;
  text: string;
  correctAnswer: number;
} 