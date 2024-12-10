import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface Participant {
  id: string;
  name: string;
  created_at: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizSessionProps {
  sessionId: string;
  isHost: boolean;
  status: string;
  questions: QuizQuestion[];
}

export function QuizSession({ sessionId, isHost, status, questions }: QuizSessionProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch initial participants
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

    // Subscribe to realtime updates for participants
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

    // Subscribe to quiz progress updates
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
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(participantsChannel);
      supabase.removeChannel(progressChannel);
    };
  }, [sessionId, toast]);

  const handleNextQuestion = async () => {
    if (!isHost) return;

    try {
      const { error } = await supabase
        .from("quiz_session_progress")
        .update({ current_question_index: currentQuestionIndex + 1 })
        .eq("session_id", sessionId);

      if (error) throw error;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to move to next question",
      });
    }
  };

  const handleSubmitAnswer = async () => {
    if (selectedOption === null) return;

    try {
      const { data: participantData } = await supabase
        .from("quiz_participants")
        .select("id")
        .eq("session_id", sessionId)
        .single();

      if (!participantData) return;

      const { error } = await supabase
        .from("participant_answers")
        .insert({
          participant_id: participantData.id,
          session_id: sessionId,
          question_index: currentQuestionIndex,
          selected_option: selectedOption,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Answer submitted successfully!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit answer",
      });
    }
  };

  if (status === "waiting") {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Participants</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="p-4 bg-white rounded-lg shadow text-center"
            >
              <p className="font-medium">{participant.name}</p>
              <p className="text-sm text-gray-500">
                Joined {new Date(participant.created_at).toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  if (!currentQuestion) {
    return <div>Quiz completed!</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">
          Question {currentQuestionIndex + 1}
        </h3>
        <p className="text-lg mb-6">{currentQuestion.question}</p>

        <RadioGroup
          value={selectedOption?.toString()}
          onValueChange={(value) => setSelectedOption(parseInt(value))}
          className="space-y-4"
        >
          {currentQuestion.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={index.toString()} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`}>{option}</Label>
            </div>
          ))}
        </RadioGroup>

        {!isHost && (
          <Button
            onClick={handleSubmitAnswer}
            className="mt-6"
            disabled={selectedOption === null}
          >
            Submit Answer
          </Button>
        )}

        {isHost && (
          <Button
            onClick={handleNextQuestion}
            className="mt-6"
          >
            Next Question
          </Button>
        )}
      </div>

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