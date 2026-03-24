import React, { useState, useEffect, useCallback } from 'react';
import { MathProblem } from '../types';
import { CheckIcon, XMarkIcon, SparklesIcon, TrophyIcon, ClockIcon } from './Icons';
import { playSound } from '../services/audioService';

interface MathGameProps {
  level: number;
  onWin: () => void;
  onLoss: () => void;
  onLevelUp: () => void;
  dailyGamesRemaining: number;
  onGamePlayed: () => void;
}

const generateProblem = (level: number): MathProblem => {
  const complexity = Math.floor(level / 5) + 1;
  const range = level * 8 + 10;
  
  let num1 = Math.floor(Math.random() * range) + 1;
  let num2 = Math.floor(Math.random() * range) + 1;
  let num3 = Math.floor(Math.random() * 10) + 1;
  
  let question = "";
  let answer = 0;

  if (complexity === 1) {
    if (Math.random() > 0.5) {
      answer = num1 + num2;
      question = `${num1} + ${num2}`;
    } else {
      if (num1 < num2) [num1, num2] = [num2, num1];
      answer = num1 - num2;
      question = `${num1} - ${num2}`;
    }
  } else if (complexity === 2) {
     num1 = Math.floor(Math.random() * 12) + 2;
     num2 = Math.floor(Math.random() * 12) + 2;
     answer = num1 * num2;
     question = `${num1} × ${num2}`;
  } else {
    const op = Math.random();
    if (op < 0.33) {
      answer = num1 + num2 - num3;
      question = `${num1} + ${num2} - ${num3}`;
    } else if (op < 0.66) {
       num1 = Math.floor(Math.random() * 15);
       answer = (num1 * 2) + num3;
       question = `(${num1} × 2) + ${num3}`;
    } else {
       answer = num1 + num2 + num3;
       question = `${num1} + ${num2} + ${num3}`;
    }
  }

  const options = new Set<number>();
  options.add(answer);
  while (options.size < 4) {
    const offset = Math.floor(Math.random() * 15) - 7;
    if (offset !== 0) options.add(answer + offset);
  }

  return {
    question,
    answer,
    options: Array.from(options).sort(() => Math.random() - 0.5)
  };
};

const MathGame: React.FC<MathGameProps> = ({ level, onWin, onLoss, onLevelUp, dailyGamesRemaining, onGamePlayed }) => {
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost' | 'limit'>('playing');
  const [streak, setStreak] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const initGame = useCallback(() => {
    if (dailyGamesRemaining <= 0) {
        setGameState('limit');
        return;
    }
    setProblem(generateProblem(level));
    setGameState('playing');
    setSelectedAnswer(null);
  }, [level, dailyGamesRemaining]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleAnswer = (option: number) => {
    if (gameState !== 'playing' || !problem) return;
    setSelectedAnswer(option);
    playSound('click');

    // Deduct a game token regardless of win/loss
    onGamePlayed();

    if (option === problem.answer) {
      setGameState('won');
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > highScore) setHighScore(newStreak);
      onWin();
      if (newStreak >= 3) { 
        playSound('win');
        setTimeout(() => {
            onLevelUp();
            setStreak(0);
            initGame();
        }, 1200);
      } else {
          playSound('success');
          setTimeout(initGame, 1000);
      }
    } else {
      setGameState('lost');
      playSound('error');
      setStreak(0);
      onLoss();
    }
  };

  const progressPercent = ((streak) / 3) * 100;

  if (gameState === 'limit') {
    return (
        <div className="w-full max-w-md mx-auto h-full flex items-center justify-center animate-fade-in">
            <div className="bg-white p-8 rounded-[32px] text-center shadow-lg border border-red-100">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ClockIcon className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">انتهت محاولاتك اليومية</h3>
                <p className="text-gray-500 text-sm mb-6">لقد وصلت للحد الأقصى المسموح به في باقتك الحالية.</p>
                <button 
                    onClick={() => playSound('click')}
                    className="w-full bg-primary text-white font-bold py-3 rounded-xl shadow-lg hover:bg-primary-dark transition"
                >
                    ترقية الباقة للمتابعة
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 border border-gray-100 relative overflow-hidden">
        
        {/* Decorative Background Elements */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>

        {/* Header */}
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div className="bg-orange-50 px-3 py-1 rounded-full flex items-center gap-1">
             <TrophyIcon className="w-4 h-4 text-orange-500" />
             <span className="text-xs font-bold text-orange-600">أعلى نتيجة: {highScore}</span>
          </div>
          <div className="flex gap-2">
            <div className="bg-red-50 px-3 py-1 rounded-full flex items-center gap-1">
                <span className="text-xs font-bold text-red-600">باقي: {dailyGamesRemaining > 1000 ? '∞' : dailyGamesRemaining}</span>
            </div>
            <div className="bg-blue-50 px-3 py-1 rounded-full flex items-center gap-1">
                <ClockIcon className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-primary">مستوى: {level}</span>
            </div>
          </div>
        </div>

        {/* Question Area */}
        <div className="text-center mb-10 relative z-10 py-6">
          <h2 className="text-6xl font-black text-gray-800 mb-6 font-sans tracking-tight drop-shadow-sm" dir="ltr">
            {problem?.question}
          </h2>
          
          {/* Progress Bar */}
          <div className="w-full max-w-[200px] mx-auto h-2 bg-gray-100 rounded-full overflow-hidden">
             <div className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }}></div>
          </div>
          <p className="text-xs text-gray-400 mt-2 font-bold">أجب 3 مرات للانتقال للمستوى التالي</p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-2 gap-4 relative z-10">
          {problem?.options.map((option, idx) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === problem?.answer;
            
            let btnClass = "bg-gray-50 text-gray-700 hover:border-primary/30 hover:bg-white hover:shadow-md";
            if (gameState !== 'playing') {
                if (isCorrect) btnClass = "bg-green-500 text-white border-green-500 shadow-lg shadow-green-200 scale-105 ring-4 ring-green-100";
                else if (isSelected && !isCorrect) btnClass = "bg-red-500 text-white border-red-500 shadow-lg shadow-red-200 ring-4 ring-red-100";
                else btnClass = "bg-gray-50 text-gray-300 opacity-40";
            }

            return (
                <button
                    key={idx}
                    onClick={() => handleAnswer(option)}
                    disabled={gameState !== 'playing'}
                    className={`
                    h-20 rounded-2xl text-2xl font-bold border-2 border-transparent transition-all duration-300 transform
                    ${btnClass}
                    `}
                >
                    {option}
                </button>
            );
          })}
        </div>

        {/* Status Messages */}
        <div className="h-10 mt-6 relative z-10 flex items-center justify-center">
            {gameState === 'won' && (
                <div className="text-center text-green-500 font-bold text-sm animate-bounce-soft flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full">
                    <SparklesIcon className="w-5 h-5 text-green-500" />
                    رائع! إجابة صحيحة
                </div>
            )}
            {gameState === 'lost' && (
                <div className="text-center">
                    <button onClick={() => { playSound('click'); initGame(); }} className="text-red-500 font-bold text-sm hover:underline flex items-center gap-2 px-4 py-2 bg-red-50 rounded-full">
                        <XMarkIcon className="w-5 h-5" />
                        حاول مرة أخرى
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default MathGame;