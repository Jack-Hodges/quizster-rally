import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CreateQuiz = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 p-4">
      <Button
        variant="ghost"
        onClick={() => navigate('/')}
        className="mb-4"
      >
        ← Back
      </Button>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Create New Quiz</h1>
        <p>Coming soon: Quiz creation form</p>
      </div>
    </div>
  );
};

export default CreateQuiz;