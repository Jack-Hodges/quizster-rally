import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Participant {
  id: string;
  name: string;
}

interface QuizData {
  title: string;
  description: string;
}

interface Session {
  id: string;
  code: string;
  quiz: QuizData;
}

const QuizSession = () => {
  const { sessionId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase
          .from('quiz_sessions')
          .select(`
            id,
            code,
            quiz:quizzes!fk_quiz (
              title,
              description
            )
          `)
          .eq('id', sessionId)
          .single();

        if (sessionError) throw sessionError;
        
        // Transform the data to match our Session type
        const formattedSession: Session = {
          id: sessionData.id,
          code: sessionData.code,
          quiz: {
            title: sessionData.quiz.title,
            description: sessionData.quiz.description,
          }
        };
        
        setSession(formattedSession);

        // Fetch initial participants
        const { data: participantsData, error: participantsError } = await supabase
          .from('quiz_participants')
          .select('id, name')
          .eq('session_id', sessionId);

        if (participantsError) throw participantsError;
        setParticipants(participantsData || []);
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

    // Subscribe to new participants
    const participantsSubscription = supabase
      .channel('quiz_participants')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'quiz_participants',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          setParticipants((current) => [...current, payload.new as Participant]);
        }
      )
      .subscribe();

    return () => {
      participantsSubscription.unsubscribe();
    };
  }, [sessionId, toast]);

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
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Participants</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="bg-white p-3 rounded-lg shadow text-center"
                  >
                    {participant.name}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuizSession;