import { z } from "zod";

export const questionSchema = z.object({
  question: z.string().min(1, "Question is required"),
  options: z.array(z.string()).min(2, "At least 2 options are required"),
  correctAnswer: z.number().min(0, "Correct answer is required"),
});

export const createQuizSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  questions: z.array(questionSchema).min(1, "At least one question is required"),
});

export type QuizFormValues = z.infer<typeof createQuizSchema>;