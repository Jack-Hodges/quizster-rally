import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { QuizBasicInfo } from "@/components/quiz/QuizBasicInfo";
import { QuizQuestion } from "@/components/quiz/QuizQuestion";
import { QuizFormValues, createQuizSchema } from "@/types/quiz";
import { supabase } from "@/lib/supabase";

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
      const { error } = await supabase
        .from('quizzes')
        .insert([
          {
            title: data.title,
            description: data.description,
            questions: data.questions,
            user_id: user?.id
          }
        ]);

      if (error) throw error;

      toast({
        title: "Quiz created!",
        description: "Your quiz has been created successfully.",
      });
      navigate('/');
    } catch (error) {
      console.error('Error creating quiz:', error);
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
            <QuizBasicInfo form={form} />

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
                <QuizQuestion
                  key={questionIndex}
                  form={form}
                  questionIndex={questionIndex}
                  onRemove={() => removeQuestion(questionIndex)}
                  onAddOption={() => addOption(questionIndex)}
                />
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