import { Participant } from "@/types/quiz";

interface WaitingRoomProps {
  participants: Participant[];
  onStartQuiz: () => void;
  isHost: boolean;
}

export function WaitingRoom({ participants, onStartQuiz, isHost }: WaitingRoomProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Participants</h2>
        {isHost && (
          <button
            onClick={onStartQuiz}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Start Quiz
          </button>
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