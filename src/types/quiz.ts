import { z } from "zod";

export interface Participant {
  id: string;
  name: string;
  created_at: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface QuizData {
  title: string;
  description: string;
  questions: QuizQuestion[];
}

export interface QuizFormValues {
  title: string;
  description: string;
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
}

export const createQuizSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string(),
  questions: z.array(
    z.object({
      question: z.string().min(1, "Question is required"),
      options: z.array(z.string().min(1, "Option is required")),
      correctAnswer: z.number().min(0),
    })
  ).min(1, "At least one question is required"),
});