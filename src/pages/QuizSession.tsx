import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuizSession as QuizSessionComponent } from "@/components/quiz/QuizSession";

interface QuizData {
  title: string;
  description: string;
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
  }>;
}

interface Session {
  id: string;
  code: string;
  quiz: QuizData;
  status: string;
}

const QuizSession = () => {
  const { sessionId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase
          .from('quiz_sessions')
          .select(`
            id,
            code,
            status,
            host_id,
            quiz:quizzes!fk_quiz (
              title,
              description,
              questions
            )
          `)
          .eq('id', sessionId)
          .single();

        if (sessionError) throw sessionError;
        
        setSession(sessionData);
        setIsHost(sessionData.host_id === user?.id);
      } catch (error) {
        console.error('Error fetching session details:', error);
        toast({
          title: "Error",
          description: "Failed to load session details",
          variant: "destructive",
        });
      }
    };

    fetchSessionDetails();
  }, [sessionId, toast, user?.id]);

  const handleStartQuiz = async () => {
    if (!sessionId) return;

    try {
      // Update session status
      const { error: updateError } = await supabase
        .from('quiz_sessions')
        .update({ status: 'in_progress' })
        .eq('id', sessionId);

      if (updateError) throw updateError;

      // Initialize quiz progress
      const { error: progressError } = await supabase
        .from('quiz_session_progress')
        .insert({
          session_id: sessionId,
          current_question_index: 0
        });

      if (progressError) throw progressError;

      toast({
        title: "Success",
        description: "Quiz started successfully!",
      });
    } catch (error) {
      console.error('Error starting quiz:', error);
      toast({
        title: "Error",
        description: "Failed to start quiz",
        variant: "destructive",
      });
    }
  };

  if (!session) {
    return <div>Loading...</div>;
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
            
            {isHost && session.status === 'waiting' && (
              <Button 
                onClick={handleStartQuiz}
                className="w-full mb-4"
              >
                Start Quiz
              </Button>
            )}

            <QuizSessionComponent 
              sessionId={sessionId!} 
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