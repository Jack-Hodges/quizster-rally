import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuizSession as QuizSessionComponent } from "@/components/quiz/QuizSession";
import { QuizData } from "@/types/quiz";

interface Session {
  id: string;
  code: string;
  quiz: QuizData;
  status: string;
  host_id: string;
}

const QuizSession = () => {
  const { sessionId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        if (!sessionId) {
          throw new Error("No session ID provided");
        }

        const { data: sessionData, error: sessionError } = await supabase
          .from("quiz_sessions")
          .select(`
            id,
            code,
            status,
            host_id,
            quiz:quizzes!quiz_sessions_quiz_id_fkey (
              title,
              description,
              questions
            )
          `)
          .eq("id", sessionId)
          .single();

        if (sessionError) {
          throw sessionError;
        }

        if (!sessionData || !sessionData.quiz) {
          throw new Error("Quiz session not found");
        }

        const transformedSession: Session = {
          id: sessionData.id,
          code: sessionData.code,
          status: sessionData.status,
          host_id: sessionData.host_id,
          quiz: sessionData.quiz as QuizData,
        };

        setSession(transformedSession);
        setIsHost(sessionData.host_id === user?.id);
      } catch (error) {
        console.error("Error fetching session details:", error);
        toast({
          title: "Error",
          description: "Failed to load session details",
          variant: "destructive",
        });
        navigate("/join");
      }
    };

    fetchSessionDetails();
  }, [sessionId, toast, user?.id, navigate]);

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-lg">Loading quiz session...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{session.quiz.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Session Code</h2>
              <p className="text-4xl font-mono tracking-wider">{session.code}</p>
            </div>
            <QuizSessionComponent
              sessionId={session.id}
              isHost={isHost}
              status={session.status}
              questions={session.quiz.questions}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuizSession;