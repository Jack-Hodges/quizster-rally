import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit } from "lucide-react";
import { QuizFormValues } from "@/types/quiz";

const ViewQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [quiz, setQuiz] = useState<QuizFormValues & { id: string }>();

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

      setQuiz(data);
    };

    fetchQuiz();
  }, [quizId, user, navigate, toast]);

  if (!quiz) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate("/my-quizzes")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Quizzes
          </Button>
          <Button onClick={() => navigate(`/quiz/${quizId}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Quiz
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{quiz.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-600">{quiz.description}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Questions</h3>
                <div className="space-y-4">
                  {quiz.questions.map((question, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <h4 className="font-medium mb-4">
                          Question {index + 1}: {question.question}
                        </h4>
                        <div className="pl-4 space-y-2">
                          {question.options.map((option, optionIndex) => (
                            <div
                              key={optionIndex}
                              className={`p-2 rounded ${
                                optionIndex === question.correctAnswer
                                  ? "bg-green-100 border border-green-300"
                                  : "bg-gray-50"
                              }`}
                            >
                              {option}
                              {optionIndex === question.correctAnswer && (
                                <span className="ml-2 text-green-600 text-sm">
                                  (Correct Answer)
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ViewQuiz;