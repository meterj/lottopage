"use client";

import React, { useState } from 'react';
import { LoadingState, BirthDateInput, ResultCard } from '../components/LottoComponents';
import './Lotto.css';
import { FREQUENCY_MAP } from '../lib/lottoData';

// ✅ 추천 번호 생성: 실제 빈도(lib/lottoData.js) + 생일 가중치

const analyzeDestinyNumbers = (birthDate) => {
  const freq = { ...FREQUENCY_MAP };

  // 생일 기반 가중치: 생일 숫자(월/일)가 1~45 범위이면 가중치 부여
  if (birthDate && birthDate.length === 8) {
    const month = parseInt(birthDate.slice(4, 6));
    const day = parseInt(birthDate.slice(6, 8));
    const year2 = parseInt(birthDate.slice(2, 4));
    [month, day, (month + day) % 45 + 1, year2 % 45 + 1].forEach(n => {
      if (n >= 1 && n <= 45) freq[n] = (freq[n] || 0) + 5;
    });
  }

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([num]) => Number(num))
    .sort((a, b) => a - b);
};

const generateWinningSets = () => {
  return Array.from({ length: 5 }, () => {
    const nums = new Set();
    while (nums.size < 6) {
      nums.add(Math.floor(Math.random() * 45) + 1);
    }
    return Array.from(nums).sort((a, b) => a - b);
  });
};

export default function Home() {
  const [gameState, setGameState] = useState('idle');
  const [birthDate, setBirthDate] = useState('');
  const [suggestionNumbers, setSuggestionNumbers] = useState([]);
  const [currentDraws, setCurrentDraws] = useState([]);

  const isBirthValid = birthDate.length === 8 && /^\d+$/.test(birthDate);

  const handleStart = () => {
    if (!isBirthValid && birthDate.length > 0) {
      alert('생년월일 8자리를 정확히 입력해주세요 (예: 19950815)');
      return;
    }
    
    setGameState('loading');
    
    // 분석 연출 (2.5초)
    setTimeout(() => {
      setSuggestionNumbers(analyzeDestinyNumbers(birthDate));
      setGameState('result');
      setCurrentDraws(generateWinningSets());
    }, 2500);
  };

  const handleReset = () => {
    setGameState('idle');
    setBirthDate('');
    setCurrentDraws([]);
  };

  return (
    <div className="lotto-container">
      <main className="main-panel">
        {/* 1. 분석 중 화면 */}
        {gameState === 'loading' && <LoadingState />}

        {/* 2. 결과 화면 */}
        {gameState === 'result' && (
          <>
            <ResultCard 
              winningSets={currentDraws} 
              suggestionNumbers={suggestionNumbers} 
              birthDate={birthDate}
            />
            <button className="reset-btn" onClick={handleReset}>
              🔄 초기화 및 다시 분석하기
            </button>
          </>
        )}

        {/* 3. 초기 화면 (생일 입력 포함) */}
        {gameState === 'idle' && (
          <div className="idle-stage">
            <h1>🎰 럭키 로또</h1>
            <p className="sub-title">프리미엄 AI 번호 예측 시스템</p>
            
            <BirthDateInput value={birthDate} onChange={setBirthDate} />
            
            <div style={{ marginTop: '20px' }}>
              <button 
                className="start-btn" 
                onClick={handleStart}
                disabled={birthDate.length > 0 && !isBirthValid}
              >
                ✨ 번호 추첨 시작
              </button>
              <p style={{ marginTop: '15px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px' }}>
                * 생년월일을 입력하면 맞춤형 번호가 생성됩니다
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
