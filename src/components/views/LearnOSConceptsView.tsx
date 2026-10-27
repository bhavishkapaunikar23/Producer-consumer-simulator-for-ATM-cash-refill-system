/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Layers,
  Lock,
  Cpu,
  GitFork,
  AlertTriangle,
  ShieldCheck,
  Award,
} from 'lucide-react';

interface OSConcept {
  id: string;
  title: string;
  definition: string;
  atmExample: string;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const LearnOSConceptsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'CARDS' | 'QUIZ'>('CARDS');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  const concepts: OSConcept[] = [
    {
      id: 'producer-consumer',
      title: 'Producer–Consumer Problem',
      definition:
        'A classical multi-process synchronization problem where one or more producers place data items into a bounded shared buffer, while one or more consumers remove and process those items.',
      atmExample:
        'The Bank Cash Refill Team acts as the Producer by depositing cash bundles into the ATM, and customers act as Consumers by withdrawing cash notes.',
    },
    {
      id: 'shared-buffer',
      title: 'Shared Buffer',
      definition:
        'A bounded memory region accessible by multiple concurrent processes with fixed minimum (0) and maximum (N) capacity limits.',
      atmExample:
        'The ATM internal cash cassette with exactly 10 slots that holds physical $100 notes ready for dispensing.',
    },
    {
      id: 'process-sync',
      title: 'Process Synchronization',
      definition:
        'The coordination of concurrent processes to ensure correct execution ordering and prevent inconsistent shared data states.',
      atmExample:
        'Ensuring that customers cannot withdraw from an empty ATM and that the bank team cannot load notes when the ATM is already full.',
    },
    {
      id: 'semaphore',
      title: 'Semaphore',
      definition:
        'An integer synchronization variable accessed only via atomic wait() [P] and signal() [V] operations to track resource availability.',
      atmExample:
        'The empty semaphore tracks available empty slots (starts at 10), while the full semaphore tracks occupied notes ready to dispense (starts at 0).',
    },
    {
      id: 'mutex',
      title: 'Mutex (Mutual Exclusion)',
      definition:
        'A binary lock (values 0 or 1) that allows only one process to enter the critical section at any given time.',
      atmExample:
        'A locking mechanism that prevents the bank refill courier and an ATM customer from modifying the internal cash slot array simultaneously.',
    },
    {
      id: 'critical-section',
      title: 'Critical Section',
      definition:
        'The portion of code where shared resources (memory, array, variables) are accessed and modified.',
      atmExample:
        'The exact software routine that updates the internal slot array (buffer[in] = cash or cash = buffer[out]) and modifies the in/out pointers.',
    },
    {
      id: 'race-condition',
      title: 'Race Condition',
      definition:
        'A bug occurring when multiple threads access and modify shared data concurrently, causing the final output to depend on the arbitrary execution order.',
      atmExample:
        'Two customers attempting to withdraw from the same ATM balance simultaneously, where an unsynchronized read-modify-write causes a lost update.',
    },
    {
      id: 'deadlock',
      title: 'Deadlock',
      definition:
        'A state where two or more processes are permanently blocked because each is waiting for a resource held by another process.',
      atmExample:
        'If a producer acquires the mutex lock first and then sleeps because the buffer is full! The consumer cannot acquire the mutex to free a slot, freezing the ATM.',
    },
  ];

  const quizQuestions: QuizQuestion[] = [
    {
      id: 1,
      question: 'In an ATM bounded buffer with a capacity of 10 slots, what are the initial semaphore values?',
      options: [
        'empty = 0, full = 10, mutex = 1',
        'empty = 10, full = 0, mutex = 1',
        'empty = 10, full = 10, mutex = 0',
        'empty = 5, full = 5, mutex = 0',
      ],
      correctIndex: 1,
      explanation: 'empty starts at capacity (10), full starts at 0 (no items), and mutex starts at 1 (unlocked binary lock).',
    },
    {
      id: 2,
      question: 'What happens when a customer attempts to withdraw from an empty ATM?',
      options: [
        'The customer overwrites slot #0.',
        'The consumer calls wait(full) and is blocked because full == 0.',
        'The mutex lock permanently fails.',
        'The ATM resets its operating system.',
      ],
      correctIndex: 1,
      explanation: 'Because full == 0, sem_wait(&full) blocks the consumer thread until a refill team signals that cash was added.',
    },
    {
      id: 3,
      question: 'What mathematical equation must always remain true in a synchronized 10-slot ATM buffer?',
      options: [
        'empty - full = 10',
        'empty + full = 10',
        'empty * full = 10',
        'empty / full = 1',
      ],
      correctIndex: 1,
      explanation: 'The number of free slots (empty) plus the number of occupied slots (full) must always equal the buffer capacity (10).',
    },
    {
      id: 4,
      question: 'Why does the producer call wait(empty) BEFORE acquiring the mutex lock?',
      options: [
        'To save CPU memory.',
        'Because acquiring mutex before wait(empty) can cause Deadlock if the buffer is full.',
        'Because mutex is a counting semaphore.',
        'It is required by C syntax.',
      ],
      correctIndex: 1,
      explanation: 'If the producer holds the mutex and then blocks because buffer is full, the consumer cannot enter to withdraw cash, resulting in a Deadlock.',
    },
    {
      id: 5,
      question: 'What does a Mutex Lock guarantee in process synchronization?',
      options: [
        'Infinite process speed',
        'Mutual Exclusion (only one process accesses shared data at a time)',
        'Unbounded buffer capacity',
        'Elimination of process queues',
      ],
      correctIndex: 1,
      explanation: 'Mutex enforces Mutual Exclusion, protecting the critical section from concurrent write corruption.',
    },
  ];

  const handleSelectAnswer = (qId: number, optIdx: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleRestartQuiz = () => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
  };

  const calculateScore = () => {
    let score = 0;
    quizQuestions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        score++;
      }
    });
    return score;
  };

  const score = calculateScore();

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-white border border-purple-200/80 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-purple-700 font-bold mb-1">
            <BookOpen className="w-4 h-4 text-purple-600" />
            <span>Operating Systems Practical Curriculum</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Learn OS Concepts & Quiz
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Fundamental process synchronization concepts explained with ATM cash refill examples, plus a college practical quiz.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 p-1 bg-purple-50/70 rounded-xl border border-purple-200 text-xs font-medium">
          <button
            onClick={() => setActiveTab('CARDS')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'CARDS'
                ? 'bg-purple-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Concept Cards (8)
          </button>
          <button
            onClick={() => setActiveTab('QUIZ')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'QUIZ'
                ? 'bg-purple-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Practical Quiz ({quizQuestions.length})
          </button>
        </div>
      </div>

      {/* Tab 1: 8 Concept Cards */}
      {activeTab === 'CARDS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {concepts.map((concept) => (
            <div
              key={concept.id}
              className="p-5 rounded-2xl bg-white border border-purple-200/80 shadow-xs flex flex-col justify-between"
            >
              <div>
                <h3 className="text-sm font-bold text-purple-950 font-mono pb-2 mb-3 border-b border-purple-100 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                  <span>{concept.title}</span>
                </h3>

                <div className="space-y-3 text-xs leading-relaxed">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-0.5">
                      OS Definition:
                    </span>
                    <p className="text-slate-700">{concept.definition}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-200">
                    <span className="text-[10px] font-mono font-bold uppercase text-purple-700 block mb-0.5">
                      ATM Cash Refill Example:
                    </span>
                    <p className="text-purple-950 text-xs font-medium">{concept.atmExample}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Interactive Quiz */}
      {activeTab === 'QUIZ' && (
        <div className="space-y-6">
          {/* Quiz Header with Score */}
          <div className="p-5 rounded-2xl bg-white border border-purple-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-purple-700 font-bold">
                <Award className="w-4 h-4 text-purple-600" />
                <span>OS Practical Multiple-Choice Evaluation</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                Test Your Process Synchronization Knowledge
              </h3>
              <p className="text-xs text-slate-500">
                Answer all {quizQuestions.length} questions to check your score.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {quizSubmitted ? (
                <div className="text-right">
                  <div className="text-xs font-mono text-slate-500">Your Score:</div>
                  <div className="text-2xl font-black font-mono text-purple-700">
                    {score} / {quizQuestions.length} ({Math.round((score / quizQuestions.length) * 100)}%)
                  </div>
                </div>
              ) : (
                <div className="text-right">
                  <div className="text-xs font-mono text-slate-500">Answered:</div>
                  <div className="text-lg font-bold font-mono text-slate-900">
                    {Object.keys(selectedAnswers).length} / {quizQuestions.length}
                  </div>
                </div>
              )}

              <button
                onClick={handleRestartQuiz}
                className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors"
                title="Restart Quiz"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            {quizQuestions.map((q, qIdx) => {
              const userAns = selectedAnswers[q.id];
              const isAnswered = userAns !== undefined;
              const isCorrect = isAnswered && userAns === q.correctIndex;

              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    quizSubmitted
                      ? isCorrect
                        ? 'bg-emerald-50/70 border-emerald-300'
                        : 'bg-rose-50/70 border-rose-300'
                      : 'bg-white border-purple-200/80 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                        {qIdx + 1}
                      </span>
                      <h4 className="text-sm font-semibold text-slate-900">
                        {q.question}
                      </h4>
                    </div>

                    {quizSubmitted && (
                      <span className="shrink-0">
                        {isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-600" />
                        )}
                      </span>
                    )}
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-3">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = userAns === optIdx;
                      const isOptionCorrect = optIdx === q.correctIndex;

                      let btnStyle =
                        'border-slate-200 bg-slate-50/60 text-slate-700 hover:border-purple-300 hover:bg-purple-50/50';

                      if (isSelected) {
                        btnStyle = 'border-purple-600 bg-purple-100 text-purple-900 font-bold';
                      }

                      if (quizSubmitted) {
                        if (isOptionCorrect) {
                          btnStyle = 'border-emerald-500 bg-emerald-100 text-emerald-950 font-bold';
                        } else if (isSelected && !isOptionCorrect) {
                          btnStyle = 'border-rose-400 bg-rose-100 text-rose-950 line-through';
                        } else {
                          btnStyle = 'border-slate-100 bg-slate-50 text-slate-400';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={quizSubmitted}
                          onClick={() => handleSelectAnswer(q.id, optIdx)}
                          className={`p-3 rounded-xl border text-left text-xs transition-all flex items-start gap-2.5 ${btnStyle}`}
                        >
                          <span className="w-4 h-4 rounded-full border border-current text-[10px] font-mono flex items-center justify-center shrink-0 mt-0.5">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="leading-snug">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Answer Explanation */}
                  {quizSubmitted && (
                    <div className="mt-3 p-3 rounded-xl bg-white border border-purple-100 text-xs font-mono text-slate-700 leading-relaxed">
                      <span className="font-bold text-purple-700 block mb-0.5">
                        {isCorrect ? 'Correct!' : 'Incorrect.'} Explanation:
                      </span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quiz Action Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-purple-100">
            <button
              onClick={handleRestartQuiz}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart Quiz</span>
            </button>

            {!quizSubmitted ? (
              <button
                onClick={() => setQuizSubmitted(true)}
                disabled={Object.keys(selectedAnswers).length === 0}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-40 transition-all shadow-xs"
              >
                Submit Answers ({Object.keys(selectedAnswers).length}/{quizQuestions.length})
              </button>
            ) : (
              <div className="text-xs font-mono font-bold text-purple-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Quiz Completed! Final Score: {score}/{quizQuestions.length}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
