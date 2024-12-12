import { Participant } from "@/types/quiz";
import { Button } from "@/components/ui/button";

interface WaitingRoomProps {
  participants: Participant[];
  onStartQuiz: () => void;
  isHost: boolean;
}

export function WaitingRoom({ participants, onStartQuiz, isHost }: WaitingRoomProps) {
  return (
    <div className="space-y-6">
      {!isHost && (
        <div className="text-center p-6 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-2">🎉 You're in!</h2>
          <p className="text-gray-600">Waiting for the host to start the quiz...</p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Participants</h2>
        {isHost && (
          <Button
            onClick={onStartQuiz}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            Start Quiz
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
            <p className="text-sm text-gray-500">
              Joined {new Date(participant.created_at).toLocaleTimeString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}