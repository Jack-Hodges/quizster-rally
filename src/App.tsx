import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import JoinQuiz from "@/pages/JoinQuiz";
import CreateQuiz from "@/pages/CreateQuiz";
import MyQuizzes from "@/pages/MyQuizzes";
import QuizSession from "@/pages/QuizSession";
import ViewQuiz from "@/pages/ViewQuiz";
import EditQuiz from "@/pages/EditQuiz";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/join" element={<JoinQuiz />} />
          <Route path="/create" element={<CreateQuiz />} />
          <Route path="/my-quizzes" element={<MyQuizzes />} />
          <Route path="/session/:sessionId" element={<QuizSession />} />
          <Route path="/quiz/:quizId" element={<ViewQuiz />} />
          <Route path="/quiz/:quizId/edit" element={<EditQuiz />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;