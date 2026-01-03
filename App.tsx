
import React, { useState, useCallback } from 'react';
import { QuizState, QuizResult, Question, HubSection } from './types';
import { generateQuestions, generateFactSheet } from './services/geminiService';
import Button from './components/Button';
import QuestionCard from './components/QuestionCard';
import QuizResultModal from './components/QuizResultModal';

const HUB_SECTIONS: HubSection[] = [
  { id: 'acronyms', title: 'Organization Acronyms', icon: 'fa-building-columns', color: 'bg-blue-100 text-blue-600', description: 'NAFDAC, FRSC, FIFA, AFDB & more.', prompt: 'Comprehensive list of important acronyms for organizations in Nigeria and internationally in 2025 with their full names and primary functions.' },
  { id: 'leadership', title: 'Leadership & Portfolios', icon: 'fa-user-tie', color: 'bg-emerald-100 text-emerald-600', description: 'Ministers, Senators & Female leaders.', prompt: 'List of current 2025 Nigerian Ministers with portfolios, Senators, and specifically identify female Deputy Governors and female Ministers.' },
  { id: 'elections', title: 'Election Calendar', icon: 'fa-check-to-slot', color: 'bg-amber-100 text-amber-600', description: 'Upcoming 2025-2027 polls.', prompt: 'Detailed list of Nigerian states where elections are scheduled to be held before the 2027 general elections, including type of election and dates.' },
  { id: 'global', title: 'Global Security & Coups', icon: 'fa-earth-africa', color: 'bg-red-100 text-red-600', description: 'Recent coups & geopolitics.', prompt: 'A comprehensive report on countries that have experienced military coups or major security shifts in Africa and globally in 2024 and 2025.' },
  { id: 'economy', title: '2025 Economic Policies', icon: 'fa-money-bill-trend-up', color: 'bg-purple-100 text-purple-600', description: 'Fiscal & monetary reforms.', prompt: 'Summary of new economic policies in Nigeria for 2025, including tax reforms, currency policies, and civil servant benefits.' },
  { id: 'sports', title: 'Sports & Culture', icon: 'fa-trophy', color: 'bg-orange-100 text-orange-600', description: '2025 major achievements.', prompt: 'Key events and achievements in Nigerian and global sports and culture for the year 2025.' },
];

const App: React.FC = () => {
  const [state, setState] = useState<QuizState>({
    questions: [],
    currentQuestionIndex: 0,
    results: [],
    status: 'idle',
    error: null
  });

  const [lastAction, setLastAction] = useState<{ type: 'quiz' | 'hub', data?: HubSection } | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  const startQuiz = useCallback(async () => {
    setLastAction({ type: 'quiz' });
    setState(prev => ({ ...prev, status: 'loading', error: null }));
    try {
      const questions = await generateQuestions(5);
      setState(prev => ({
        ...prev,
        questions,
        currentQuestionIndex: 0,
        results: [],
        status: 'active'
      }));
    } catch (error: any) {
      setState(prev => ({ ...prev, status: 'error', error: "The system is momentarily busy. Please try again shortly." }));
    }
  }, []);

  const openHub = useCallback(async (section: HubSection) => {
    setLastAction({ type: 'hub', data: section });
    setState(prev => ({ ...prev, status: 'loading', error: null }));
    try {
      const content = await generateFactSheet(section.id, section.prompt);
      setState(prev => ({
        ...prev,
        status: 'browsing',
        hubContent: content,
        hubTitle: section.title
      }));
    } catch (error: any) {
      setState(prev => ({ ...prev, status: 'error', error: "Our data hub is currently at full capacity. Please check back in a moment." }));
    }
  }, []);

  const handleRetry = () => {
    if (lastAction?.type === 'quiz') {
      startQuiz();
    } else if (lastAction?.type === 'hub' && lastAction.data) {
      openHub(lastAction.data);
    }
  };

  const goHome = () => {
    setState({
      questions: [],
      currentQuestionIndex: 0,
      results: [],
      status: 'idle',
      error: null
    });
    setSelectedAnswer(null);
    setIsRevealed(false);
    setLastAction(null);
  };

  const currentQuestion = state.questions[state.currentQuestionIndex];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 md:p-8">
      <header className="w-full max-w-4xl flex items-center justify-between mb-8 md:mb-12">
        <button onClick={goHome} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <i className="fa-solid fa-graduation-cap text-lg"></i>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
            asy<span className="text-emerald-600">book</span>
          </h1>
        </button>
        {state.status !== 'idle' && (
          <button onClick={goHome} className="text-slate-500 hover:text-emerald-600 font-semibold text-sm flex items-center gap-2">
            <i className="fa-solid fa-house"></i>
            <span>Home</span>
          </button>
        )}
      </header>

      <main className="w-full max-w-4xl flex-grow flex flex-col">
        {state.status === 'idle' && (
          <div className="animate-fadeIn">
            <section className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
                Ace Your <span className="text-emerald-600">Career</span> Goals in 2025
              </h2>
              <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
                The ultimate companion for Nigerian civil servants and current affairs enthusiasts. 
                Test your knowledge or browse the 2025 Knowledge Hub.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={startQuiz} className="py-5 px-10 text-xl rounded-2xl shadow-xl shadow-emerald-200">
                  Take Promo Quiz
                </Button>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px bg-slate-200 flex-grow"></div>
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">2025 Knowledge Hub</h3>
                <div className="h-px bg-slate-200 flex-grow"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {HUB_SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => openHub(section)}
                    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 text-left group hover:-translate-y-1"
                  >
                    <div className={`w-12 h-12 rounded-2xl ${section.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <i className={`fa-solid ${section.icon} text-xl`}></i>
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 mb-2">{section.title}</h4>
                    <p className="text-sm text-slate-500 leading-relaxed mb-4">{section.description}</p>
                    <div className="text-emerald-600 text-xs font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                      Browse List <i className="fa-solid fa-arrow-right"></i>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        {state.status === 'loading' && (
          <div className="text-center py-20 animate-pulse">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fa-solid fa-spinner fa-spin text-3xl text-emerald-600"></i>
            </div>
            <h3 className="text-2xl font-bold text-slate-800">Please wait...</h3>
            <p className="text-slate-500 mt-4 max-w-sm mx-auto">
              We are retrieving the latest 2025 information for you.
            </p>
          </div>
        )}

        {state.status === 'active' && currentQuestion && (
          <div className="max-w-2xl mx-auto w-full flex flex-col gap-6">
             <QuestionCard 
              question={currentQuestion}
              selectedAnswer={selectedAnswer}
              onSelect={(ans) => !isRevealed && setSelectedAnswer(ans)}
              isRevealed={isRevealed}
            />
            <div className="flex justify-center gap-4">
              {!isRevealed ? (
                <Button disabled={!selectedAnswer} onClick={() => setIsRevealed(true)} className="w-full md:w-1/2 py-4">
                  Verify Answer
                </Button>
              ) : (
                <Button 
                  onClick={() => {
                    const result: QuizResult = {
                      questionId: currentQuestion.id,
                      userAnswer: selectedAnswer!,
                      isCorrect: selectedAnswer === currentQuestion.correctAnswer,
                      timeSpent: 0
                    };
                    const isLast = state.currentQuestionIndex === state.questions.length - 1;
                    setState(prev => ({
                      ...prev,
                      results: [...prev.results, result],
                      currentQuestionIndex: isLast ? prev.currentQuestionIndex : prev.currentQuestionIndex + 1,
                      status: isLast ? 'finished' : 'active'
                    }));
                    setSelectedAnswer(null);
                    setIsRevealed(false);
                  }}
                  variant="secondary"
                  className="w-full md:w-1/2 py-4"
                >
                  {state.currentQuestionIndex === state.questions.length - 1 ? 'Finish Quiz' : 'Next Topic'}
                </Button>
              )}
            </div>
          </div>
        )}

        {state.status === 'browsing' && (
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-slate-100 animate-fadeIn overflow-hidden">
            <div className="flex items-center justify-between mb-8 border-b pb-6">
              <h2 className="text-3xl font-black text-slate-800">{state.hubTitle}</h2>
              <Button variant="outline" onClick={goHome} className="px-4 py-2">
                <i className="fa-solid fa-times mr-2"></i> Close
              </Button>
            </div>
            <div className="prose prose-slate max-w-none text-slate-700 leading-loose">
              <div className="whitespace-pre-wrap font-medium">
                {state.hubContent}
              </div>
            </div>
            <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-xs text-slate-400 font-medium italic">
                <i className="fa-solid fa-clock mr-1"></i> Information synced for your current session.
              </p>
              <Button onClick={goHome}>Return Home</Button>
            </div>
          </div>
        )}

        {state.status === 'finished' && (
          <QuizResultModal state={state} onRestart={startQuiz} onHome={goHome} />
        )}

        {state.status === 'error' && (
          <div className="text-center p-12 bg-white rounded-3xl shadow-xl border border-slate-100 max-w-md mx-auto animate-fadeIn">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fa-solid fa-hourglass-half text-2xl text-slate-400"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Almost There...</h3>
            <p className="text-slate-500 mb-6 leading-relaxed text-sm">
              {state.error}
            </p>
            <div className="flex flex-col gap-3">
              <Button onClick={handleRetry} className="w-full py-4">
                Try Again Now
              </Button>
              <Button onClick={goHome} variant="outline" className="w-full py-4">
                Return to Home
              </Button>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-16 py-8 border-t border-slate-200 w-full max-w-4xl flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-sm">
        <p>© 2025 asybook Knowledge Hub. Built for Excellence.</p>
        <div className="flex gap-6">
          <span className="flex items-center gap-2"><i className="fa-solid fa-shield-halved text-emerald-500"></i> Secure</span>
          <span className="flex items-center gap-2"><i className="fa-solid fa-bolt text-amber-500"></i> AI Powered</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
