import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import JoinQuiz from "@/pages/JoinQuiz";
import CreateQuiz from "@/pages/CreateQuiz";
import MyQuizzes from "@/pages/MyQuizzes";
import QuizSessionPage from "@/pages/QuizSessionPage";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/join" element={<JoinQuiz />} />
          <Route path="/create" element={<CreateQuiz />} />
          <Route path="/my-quizzes" element={<MyQuizzes />} />
          <Route path="/quiz-session/:sessionId" element={<QuizSessionPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;