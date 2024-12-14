import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { QuizQuestion } from "@/types/quiz";

interface QuestionDisplayProps {
  sessionId: string;
  question: QuizQuestion;
  questionIndex: number;
  isHost: boolean;
  questionState: string;
  onContinue: () => void;
}

export function QuestionDisplay({
  sessionId,
  question,
  questionIndex,
  isHost,
  questionState,
  onContinue,
}: QuestionDisplayProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submittedAnswer, setSubmittedAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setSelectedOption(null);
    setSubmittedAnswer(false);
    setIsCorrect(null);
  }, [questionIndex]);

  const handleSubmitAnswer = async () => {
    if (selectedOption === null) return;

    try {
      // Get all participants for this session and user
      const { data: participantsData, error: participantsError } = await supabase
        .from("quiz_participants")
        .select("id")
        .eq("session_id", sessionId);

      if (participantsError) throw participantsError;
      
      // If no participants found or empty array, show error
      if (!participantsData || participantsData.length === 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Participant not found",
        });
        return;
      }

      // Use the first participant found
      const participantId = participantsData[0].id;

      const { error: answerError } = await supabase.from("participant_answers").insert({
        participant_id: participantId,
        session_id: sessionId,
        question_index: questionIndex,
        selected_option: selectedOption,
      });

      if (answerError) throw answerError;

      setSubmittedAnswer(true);
      setIsCorrect(selectedOption === question.correctAnswer);

      toast({
        title: "Success",
        description: "Answer submitted successfully!",
      });
    } catch (error) {
      console.error("Error submitting answer:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit answer",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">
          Question {questionIndex + 1}
        </h3>
        <p className="text-lg mb-6">{question.question}</p>

        {questionState === "answering" ? (
          <>
            <RadioGroup
              value={selectedOption?.toString()}
              onValueChange={(value) => setSelectedOption(parseInt(value))}
              className="space-y-4"
              disabled={submittedAnswer}
            >
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>

            {!isHost && !submittedAnswer && (
              <Button
                onClick={handleSubmitAnswer}
                className="mt-6"
                disabled={selectedOption === null}
              >
                Submit Answer
              </Button>
            )}
          </>
        ) : (
          <div className="space-y-4">
            {question.options.map((option, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${
                  index === question.correctAnswer
                    ? "bg-green-100 border-green-500"
                    : submittedAnswer && selectedOption === index
                    ? "bg-red-100 border-red-500"
                    : "bg-gray-50"
                } border`}
              >
                <p>{option}</p>
              </div>
            ))}
            {submittedAnswer && (
              <p className={`font-medium ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                {isCorrect ? "Correct!" : "Incorrect"}
              </p>
            )}
          </div>
        )}

        {isHost && (
          <Button onClick={onContinue} className="mt-6">
            {questionState === "answering" ? "Show Answer" : "Next Question"}
          </Button>
        )}
      </div>
    </div>
  );
}