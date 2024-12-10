import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Quizster Rally
          </CardTitle>
          <CardDescription>
            Create and join interactive quiz games in real-time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user ? (
            <>
              <Button 
                onClick={() => navigate('/create')} 
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Create Quiz
              </Button>
              <Button 
                onClick={() => navigate('/my-quizzes')} 
                variant="outline"
                className="w-full"
              >
                My Quizzes
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => navigate('/join')} 
              variant="outline"
              className="w-full"
            >
              Join Quiz
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;