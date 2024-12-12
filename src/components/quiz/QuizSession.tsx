import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { WaitingRoom } from "./WaitingRoom";
import { QuestionDisplay } from "./QuestionDisplay";
import { Participant, QuizQuestion } from "@/types/quiz";

interface QuizSessionProps {
  sessionId: string;
  isHost: boolean;
  status: string;
  questions: QuizQuestion[];
}

export function QuizSession({ sessionId, isHost, status, questions }: QuizSessionProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [questionState, setQuestionState] = useState<string>("answering");
  const { toast } = useToast();

  useEffect(() => {
    const fetchParticipants = async () => {
      const { data, error } = await supabase
        .from("quiz_participants")
        .select("*")
        .eq("session_id", sessionId);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error fetching participants",
          description: error.message,
        });
        return;
      }

      setParticipants(data || []);
    };

    fetchParticipants();

    const participantsChannel = supabase
      .channel("quiz_participants")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "quiz_participants",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setParticipants((current) => [...current, payload.new as Participant]);
          } else if (payload.eventType === "DELETE") {
            setParticipants((current) =>
              current.filter((p) => p.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    const progressChannel = supabase
      .channel("quiz_progress")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "quiz_session_progress",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            setCurrentQuestionIndex(payload.new.current_question_index);
            setQuestionState(payload.new.question_state);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(participantsChannel);
      supabase.removeChannel(progressChannel);
    };
  }, [sessionId, toast]);

  const handleStartQuiz = async () => {
    if (!isHost) return;

    try {
      const { error } = await supabase
        .from("quiz_sessions")
        .update({ status: "in_progress" })
        .eq("id", sessionId);

      if (error) throw error;

      const { error: progressError } = await supabase
        .from("quiz_session_progress")
        .insert({
          session_id: sessionId,
          current_question_index: 0,
          question_state: "answering",
        });

      if (progressError) throw progressError;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start quiz",
      });
    }
  };

  const handleContinue = async () => {
    if (!isHost) return;

    try {
      if (questionState === "answering") {
        const { error } = await supabase
          .from("quiz_session_progress")
          .update({ question_state: "showing_answer" })
          .eq("session_id", sessionId);

        if (error) throw error;
      } else {
        const nextIndex = currentQuestionIndex + 1;
        const { error } = await supabase
          .from("quiz_session_progress")
          .update({
            current_question_index: nextIndex,
            question_state: "answering",
          })
          .eq("session_id", sessionId);

        if (error) throw error;
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update quiz progress",
      });
    }
  };

  if (status === "waiting") {
    return (
      <WaitingRoom
        participants={participants}
        onStartQuiz={handleStartQuiz}
        isHost={isHost}
      />
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  if (!currentQuestion) {
    return <div>Quiz completed!</div>;
  }

  return (
    <div className="space-y-6">
      <QuestionDisplay
        sessionId={sessionId}
        question={currentQuestion}
        questionIndex={currentQuestionIndex}
        isHost={isHost}
        questionState={questionState}
        onContinue={handleContinue}
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className="p-4 bg-white rounded-lg shadow text-center"
          >
            <p className="font-medium">{participant.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}