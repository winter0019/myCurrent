
import React from 'react';
import { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  selectedAnswer: string | null;
  onSelect: (answer: string) => void;
  isRevealed: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ 
  question, 
  selectedAnswer, 
  onSelect, 
  isRevealed 
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 animate-fadeIn border border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          {question.category}
        </span>
      </div>

      <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-8 leading-relaxed">
        {question.question}
      </h2>

      <div className="space-y-4">
        {question.options.map((option, idx) => {
          const isSelected = selectedAnswer === option;
          const isCorrect = option === question.correctAnswer;
          const showCorrect = isRevealed && isCorrect;
          const showWrong = isRevealed && isSelected && !isCorrect;

          return (
            <button
              key={idx}
              onClick={() => !isRevealed && onSelect(option)}
              disabled={isRevealed}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 group relative
                ${!isRevealed ? 'hover:border-emerald-500 hover:bg-emerald-50 border-slate-200' : 'cursor-default'}
                ${isSelected && !isRevealed ? 'border-emerald-500 bg-emerald-50' : ''}
                ${showCorrect ? 'border-green-500 bg-green-50' : ''}
                ${showWrong ? 'border-red-500 bg-red-50' : ''}
              `}
            >
              <div className="flex items-center">
                <span className={`w-8 h-8 flex items-center justify-center rounded-lg mr-4 font-bold text-sm
                  ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}
                  ${showCorrect ? 'bg-green-600 text-white' : ''}
                  ${showWrong ? 'bg-red-600 text-white' : ''}
                `}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className={`font-medium ${isSelected || showCorrect || showWrong ? 'text-slate-900' : 'text-slate-600'}`}>
                  {option}
                </span>
              </div>
              
              {showCorrect && (
                <i className="fa-solid fa-check text-green-600 absolute right-4 top-1/2 -translate-y-1/2"></i>
              )}
              {showWrong && (
                <i className="fa-solid fa-xmark text-red-600 absolute right-4 top-1/2 -translate-y-1/2"></i>
              )}
            </button>
          );
        })}
      </div>

      {isRevealed && (
        <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-200 animate-slideUp">
          <h4 className="font-bold text-slate-800 mb-2 flex items-center">
            <i className="fa-solid fa-circle-info mr-2 text-emerald-600"></i>
            Quick Context
          </h4>
          <p className="text-slate-600 leading-relaxed text-sm">
            {question.explanation}
          </p>
          {question.groundingSources && question.groundingSources.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <span className="text-xs font-semibold text-slate-400 uppercase block mb-2">Sources</span>
              <div className="flex flex-wrap gap-2">
                {question.groundingSources.map((source, i) => (
                  <a 
                    key={i} 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-600 hover:underline flex items-center bg-white px-2 py-1 rounded border"
                  >
                    <i className="fa-solid fa-link mr-1"></i> {source.title}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
