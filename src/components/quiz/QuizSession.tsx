import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

interface Participant {
  id: string;
  name: string;
  created_at: string;
}

export function QuizSession({ sessionId }: { sessionId: string }) {
  const [participants, setParticipants] = useState<Participant[]>([]);
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

    // Subscribe to realtime updates
    const channel = supabase
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, toast]);

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