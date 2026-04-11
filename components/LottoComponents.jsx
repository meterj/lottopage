"use client";

import React from 'react';
import '../app/Lotto.css';
import { HOT_NUMBERS, COLD_NUMBERS } from '../lib/lottoData';

// 1. 생일 입력 컴포넌트 (V2 신규)
export const BirthDateInput = ({ value, onChange }) => (
  <div className="input-group">
    <label className="input-label">생년월일 입력</label>
    <input 
      type="text" 
      className="birth-input" 
      placeholder="YYYYMMDD (예: 19950815)"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      maxLength={8}
    />
  </div>
);

// 2. 프리미엄 로딩/분석 상태 UI
export const LoadingState = () => (
  <div className="loading-overlay">
    <div className="matrix-spinner"></div>
    <div className="matrix-text">데이터 분석 중...</div>
    <div style={{ marginTop: '15px', color: 'rgba(255, 222, 55, 0.4)', fontSize: '0.8rem', fontFamily: 'JetBrains Mono' }}>
      과거 당첨 패턴 분석 중 — 잠시만 기다려주세요
    </div>
  </div>
);

// 3. 애니메이션 추첨 결과 (V2)
export const AnimationDisplay = ({ numbers }) => (
  <div className="animation-stage" style={{ display: 'flex', gap: '15px' }}>
    {numbers.map((num, idx) => (
      <div key={idx} className="ball" style={{ animationDelay: `${idx * 0.1}s` }}>
        {num}
      </div>
    ))}
  </div>
);

// 4. 최종 결과/통계 카드 (V2)
export const ResultCard = ({ winningSets, suggestionNumbers, birthDate }) => {
  // 실제 데이터 기반 Hot/Cold 분류
  const getNumClass = (n) => {
    if (HOT_NUMBERS.has(n)) return 'hot';
    if (COLD_NUMBERS.has(n)) return 'cold';
    return '';
  };

  const destinyMsg = birthDate
    ? `🌟 ${birthDate.slice(0,4)}년 ${birthDate.slice(4,6)}월 ${birthDate.slice(6,8)}일생 맞춤형 추천 번호`
    : 'AI 알고리즘 기반 고확률 추천 번호';

  return (
    <div className="result-card">
      <h2 className="result-title">🎉 행운의 5세트 확정 🎉</h2>
      
      <div className="sets-grid">
        {winningSets.map((set, setIdx) => (
          <div key={setIdx} className="set-row">
            <span className="set-tag">{setIdx + 1}세트</span>
            <div className="ball-group">
              {set.map((num, idx) => (
                <div key={idx} className={`ball-v2 ${getNumClass(num)}`} style={{ animationDelay: `${idx * 0.05}s` }}>
                  {num}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 범례 설명 */}
      <div className="legend-box">
        <div className="legend-item">
          <span className="legend-dot hot-dot"></span>
          <span>빨간 테두리 = 실제로 자주 나온 <strong>HOT</strong> 번호</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot cold-dot"></span>
          <span>파란 테두리 = 실제로 드물게 나온 <strong>COLD</strong> 번호</span>
        </div>
        {birthDate && (
          <div className="legend-item">
            <span>✨ 생일 입력 시 해당 날짜 숫자에 가중치 부여해서 맞춤 추천</span>
          </div>
        )}
      </div>
      
      <div className="suggestion-v2">
        <div className="destiny-msg">
          {destinyMsg}
        </div>
        <div className="suggestion-row">
          {suggestionNumbers.join('  —  ')}
        </div>
      </div>

      {/* 동행복권 링크 버튼 */}
      <div className="dhlottery-links">
        <a
          href="https://www.dhlottery.co.kr/common.do?method=main"
          target="_blank"
          rel="noopener noreferrer"
          className="dhlottery-btn"
        >
          🎫 동행복권 홈페이지
        </a>
        <a
          href="https://www.dhlottery.co.kr/gameResult.do?method=byWin"
          target="_blank"
          rel="noopener noreferrer"
          className="dhlottery-btn dhlottery-btn-secondary"
        >
          🏆 최신 당첨번호 확인
        </a>
      </div>
      <p className="dhlottery-note">* 사이트 접속이 안 될 경우 <strong>로또ON 앱</strong>을 이용해 주세요</p>
    </div>
  );
};
