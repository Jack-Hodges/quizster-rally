import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { QuizBasicInfo } from "@/components/quiz/QuizBasicInfo";
import { QuizQuestion } from "@/components/quiz/QuizQuestion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { QuizFormValues, createQuizSchema } from "@/types/quiz";
import { ArrowLeft, Plus } from "lucide-react";

const EditQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  const form = useForm<QuizFormValues>({
    resolver: zodResolver(createQuizSchema),
    defaultValues: {
      title: "",
      description: "",
      questions: [],
    },
  });

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!quizId || !user) return;

      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("id", quizId)
        .single();

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load quiz",
        });
        navigate("/my-quizzes");
        return;
      }

      form.reset(data);
      setLoading(false);
    };

    fetchQuiz();
  }, [quizId, user, navigate, toast, form]);

  const onSubmit = async (values: QuizFormValues) => {
    if (!quizId || !user) return;

    const { error } = await supabase
      .from("quizzes")
      .update({
        title: values.title,
        description: values.description,
        questions: values.questions,
      })
      .eq("id", quizId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update quiz",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Quiz updated successfully",
    });
    navigate(`/quiz/${quizId}`);
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

  const removeQuestion = (index: number) => {
    const currentQuestions = form.getValues("questions");
    form.setValue(
      "questions",
      currentQuestions.filter((_, i) => i !== index)
    );
  };

  const addOption = (questionIndex: number) => {
    const currentQuestions = form.getValues("questions");
    const updatedQuestions = [...currentQuestions];
    updatedQuestions[questionIndex].options.push("");
    form.setValue("questions", updatedQuestions);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate(`/quiz/${quizId}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Quiz
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Edit Quiz</h1>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <QuizBasicInfo form={form} />

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Questions</h2>
                  <Button type="button" onClick={addQuestion}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </div>

                {form.watch("questions").map((_, index) => (
                  <QuizQuestion
                    key={index}
                    form={form}
                    questionIndex={index}
                    onRemove={() => removeQuestion(index)}
                    onAddOption={() => addOption(index)}
                  />
                ))}
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/quiz/${quizId}`)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default EditQuiz;