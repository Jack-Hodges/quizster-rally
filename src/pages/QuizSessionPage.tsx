import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { QuizSession } from "@/components/quiz/QuizSession";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const QuizSessionPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [sessionDetails, setSessionDetails] = useState<{
    code: string;
    status: string;
    host_id: string;
    questions: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
    }>;
  } | null>(null);

  useEffect(() => {
    const fetchSessionDetails = async () => {
      if (!sessionId) return;

      const { data, error } = await supabase
        .from("quiz_sessions")
        .select(`
          code, 
          status,
          host_id,
          quizzes!fk_quiz (questions)
        `)
        .eq("id", sessionId)
        .single();

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load quiz session",
        });
        navigate("/join");
        return;
      }

      setSessionDetails({
        code: data.code,
        status: data.status,
        host_id: data.host_id,
        questions: data.quizzes.questions
      });
    };

    fetchSessionDetails();
  }, [sessionId, navigate, toast]);

  if (!sessionId || !sessionDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate("/join")} className="mb-4">
            ← Back to Join
          </Button>
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold mb-2">Quiz Session</h1>
            <p className="text-lg mb-4">
              Session Code: <span className="font-mono font-bold">{sessionDetails.code}</span>
            </p>
            <QuizSession 
              sessionId={sessionId} 
              isHost={user?.id === sessionDetails.host_id}
              status={sessionDetails.status}
              questions={sessionDetails.questions}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizSessionPage;