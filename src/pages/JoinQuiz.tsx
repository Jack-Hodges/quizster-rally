import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRight } from "lucide-react";
import { JoinQuizForm } from "@/components/quiz/JoinQuizForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PublicQuiz {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

const JoinQuiz = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState<PublicQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [selectedQuizCode, setSelectedQuizCode] = useState("");

  useEffect(() => {
    const fetchPublicQuizzes = async () => {
      try {
        const { data, error } = await supabase
          .from("quizzes")
          .select("id, title, description, created_at")
          .eq("is_published", true)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setQuizzes(data || []);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
        toast({
          title: "Error",
          description: "Failed to fetch available quizzes",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPublicQuizzes();
  }, [toast]);

  const handleJoinSession = (sessionId: string) => {
    setShowJoinDialog(false);
    // Navigate to the quiz session page (to be implemented)
    navigate(`/quiz-session/${sessionId}`);
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 p-4">
      <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
        ← Back
      </Button>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Join a Quiz</h1>
          <Button onClick={() => setShowJoinDialog(true)}>
            Enter Quiz Code
          </Button>
        </div>

        <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Join Quiz Session</DialogTitle>
            </DialogHeader>
            <JoinQuizForm code={selectedQuizCode} onJoin={handleJoinSession} />
          </DialogContent>
        </Dialog>

        {quizzes.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow">
            <p className="text-gray-600">No public quizzes available at the moment.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quizzes.map((quiz) => (
                  <TableRow key={quiz.id}>
                    <TableCell className="font-medium">{quiz.title}</TableCell>
                    <TableCell>{quiz.description}</TableCell>
                    <TableCell>{new Date(quiz.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => setShowJoinDialog(true)}>
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Join
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinQuiz;