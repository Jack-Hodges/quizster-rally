import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

export function JoinQuizForm({ code, onJoin }: { code?: string; onJoin: (sessionId: string) => void }) {
  const [quizCode, setQuizCode] = useState(code || "");
  const [name, setName] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const { toast } = useToast();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsJoining(true);

    try {
      // First, find the session with the given code
      const { data: sessions, error: sessionError } = await supabase
        .from("quiz_sessions")
        .select("id")
        .eq("code", quizCode)
        .eq("status", "waiting");

      if (sessionError) throw sessionError;
      if (!sessions || sessions.length === 0) {
        throw new Error("Invalid quiz code or quiz has already started");
      }

      // Then, add the participant
      const { error: participantError } = await supabase
        .from("quiz_participants")
        .insert([
          {
            session_id: sessions[0].id,
            name: name,
          },
        ]);

      if (participantError) throw participantError;

      toast({
        title: "Joined successfully!",
        description: "You've joined the quiz session.",
      });

      onJoin(sessions[0].id);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error joining quiz",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <form onSubmit={handleJoin} className="space-y-4">
      <div className="space-y-2">
        <Input
          type="text"
          placeholder="Enter quiz code"
          value={quizCode}
          onChange={(e) => setQuizCode(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={isJoining} className="w-full">
        {isJoining ? "Joining..." : "Join Quiz"}
      </Button>
    </form>
  );
}