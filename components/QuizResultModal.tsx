
import React from 'react';
import { QuizState } from '../types';
import Button from './Button';

interface QuizResultModalProps {
  state: QuizState;
  onRestart: () => void;
  onHome: () => void;
}

const QuizResultModal: React.FC<QuizResultModalProps> = ({ state, onRestart, onHome }) => {
  const total = state.questions.length;
  const correct = state.results.filter(r => r.isCorrect).length;
  const percentage = Math.round((correct / total) * 100);

  let message = "";
  let icon = "";
  let iconColor = "";

  if (percentage >= 80) {
    message = "Outstanding! You're a true current affairs expert.";
    icon = "fa-trophy";
    iconColor = "text-yellow-500";
  } else if (percentage >= 60) {
    message = "Great job! You have a solid grasp of recent events.";
    icon = "fa-star";
    iconColor = "text-blue-500";
  } else {
    message = "Keep learning! The world is changing fast.";
    icon = "fa-book-open";
    iconColor = "text-emerald-500";
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center max-w-2xl w-full mx-auto animate-fadeIn">
      <div className={`text-6xl mb-6 ${iconColor}`}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
      
      <h2 className="text-3xl font-bold text-slate-800 mb-2">Quiz Completed!</h2>
      <p className="text-slate-500 mb-8">{message}</p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-slate-50 p-6 rounded-2xl">
          <div className="text-3xl font-bold text-slate-800">{correct}/{total}</div>
          <div className="text-sm text-slate-500 font-medium">Score</div>
        </div>
        <div className="bg-slate-50 p-6 rounded-2xl">
          <div className="text-3xl font-bold text-slate-800">{percentage}%</div>
          <div className="text-sm text-slate-500 font-medium">Accuracy</div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button onClick={onRestart} className="w-full py-4 text-lg">
          Take Another Quiz
        </Button>
        <Button onClick={onHome} variant="outline" className="w-full py-4 text-lg">
          Back to Main Screen
        </Button>
        <p className="text-xs text-slate-400 mt-4">
          Questions are generated in real-time using Gemini Flash with Google Search Grounding for 2025 accuracy.
        </p>
      </div>
    </div>
  );
};

export default QuizResultModal;
