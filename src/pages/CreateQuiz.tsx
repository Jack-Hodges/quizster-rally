import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const questionSchema = z.object({
  question: z.string().min(1, "Question is required"),
  options: z.array(z.string()).min(2, "At least 2 options are required"),
  correctAnswer: z.number().min(0, "Correct answer is required"),
});

const createQuizSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  questions: z.array(questionSchema).min(1, "At least one question is required"),
});

type QuizFormValues = z.infer<typeof createQuizSchema>;

const CreateQuiz = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const form = useForm<QuizFormValues>({
    resolver: zodResolver(createQuizSchema),
    defaultValues: {
      title: "",
      description: "",
      questions: [
        {
          question: "",
          options: ["", ""],
          correctAnswer: 0,
        },
      ],
    },
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const onSubmit = async (data: QuizFormValues) => {
    try {
      console.log("Quiz data:", data);
      toast({
        title: "Quiz created!",
        description: "Your quiz has been created successfully.",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create quiz. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addQuestion = () => {
    const currentQuestions = form.getValues("questions");
    form.setValue("questions", [
      ...currentQuestions,
      {
        question: "",
        options: ["", ""],
        correctAnswer: 0,
      },
    ]);
  };

  const addOption = (questionIndex: number) => {
    const currentOptions = form.getValues(`questions.${questionIndex}.options`);
    form.setValue(`questions.${questionIndex}.options`, [...currentOptions, ""]);
  };

  const removeQuestion = (index: number) => {
    const currentQuestions = form.getValues("questions");
    form.setValue(
      "questions",
      currentQuestions.filter((_, i) => i !== index)
    );
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 p-4">
      <Button
        variant="ghost"
        onClick={() => navigate('/')}
        className="mb-4"
      >
        ← Back
      </Button>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Create New Quiz</h1>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quiz Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter quiz title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter quiz description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Questions</h2>
                <Button
                  type="button"
                  onClick={addQuestion}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  Add Question
                </Button>
              </div>

              {form.watch("questions").map((_, questionIndex) => (
                <div key={questionIndex} className="p-4 border rounded-lg bg-white">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-medium">Question {questionIndex + 1}</h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(questionIndex)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <FormField
                    control={form.control}
                    name={`questions.${questionIndex}.question`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Question Text</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter your question" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="mt-4 space-y-4">
                    <Label>Options</Label>
                    {form.watch(`questions.${questionIndex}.options`).map((_, optionIndex) => (
                      <FormField
                        key={optionIndex}
                        control={form.control}
                        name={`questions.${questionIndex}.options.${optionIndex}`}
                        render={({ field }) => (
                          <div className="flex items-center gap-2">
                            <Input {...field} placeholder={`Option ${optionIndex + 1}`} />
                            <RadioGroup
                              value={form.watch(`questions.${questionIndex}.correctAnswer`).toString()}
                              onValueChange={(value) => {
                                form.setValue(`questions.${questionIndex}.correctAnswer`, parseInt(value));
                              }}
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value={optionIndex.toString()} id={`correct-${questionIndex}-${optionIndex}`} />
                                <Label htmlFor={`correct-${questionIndex}-${optionIndex}`}>Correct</Label>
                              </div>
                            </RadioGroup>
                          </div>
                        )}
                      />
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addOption(questionIndex)}
                      className="mt-2"
                    >
                      Add Option
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button type="submit" className="w-full">
              Create Quiz
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateQuiz;