"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import "./Lotto.css";

const LOTTO_STATS = {
  range: "2021-05-08~2026-04-25",
  latestRound: 1221,
  latestDate: "2026-04-25",
  drawCount: 260,
  frequency: [34, 27, 43, 26, 25, 46, 42, 28, 32, 27, 34, 40, 41, 35, 36, 42, 32, 33, 36, 33, 38, 32, 33, 36, 28, 37, 39, 36, 37, 39, 36, 31, 38, 35, 42, 35, 40, 41, 29, 33, 28, 29, 22, 34, 40],
  bonusFrequency: [3, 10, 8, 7, 7, 6, 11, 5, 4, 5, 5, 4, 1, 4, 9, 5, 8, 4, 5, 6, 4, 6, 4, 10, 6, 5, 6, 10, 4, 5, 10, 10, 6, 6, 4, 6, 6, 4, 4, 5, 4, 4, 1, 7, 6],
  recency: [2, 1, 3, 16, 8, 0, 11, 4, 11, 4, 8, 19, 0, 5, 2, 16, 11, 0, 6, 4, 6, 1, 5, 5, 1, 10, 7, 0, 4, 0, 3, 3, 7, 1, 10, 0, 12, 8, 2, 10, 9, 3, 1, 6, 2],
  top: [
    { n: 6, c: 46, r: 0 }, { n: 3, c: 43, r: 3 }, { n: 35, c: 42, r: 10 },
    { n: 7, c: 42, r: 11 }, { n: 16, c: 42, r: 16 }, { n: 13, c: 41, r: 0 },
    { n: 38, c: 41, r: 8 }, { n: 45, c: 40, r: 2 }, { n: 37, c: 40, r: 12 },
    { n: 12, c: 40, r: 19 }, { n: 30, c: 39, r: 0 }, { n: 27, c: 39, r: 7 },
  ],
  cold: [
    { n: 43, c: 22, r: 1 }, { n: 5, c: 25, r: 8 }, { n: 4, c: 26, r: 16 },
    { n: 10, c: 27, r: 4 }, { n: 2, c: 27, r: 1 }, { n: 41, c: 28, r: 9 },
    { n: 8, c: 28, r: 4 }, { n: 25, c: 28, r: 1 }, { n: 42, c: 29, r: 3 },
    { n: 39, c: 29, r: 2 }, { n: 32, c: 31, r: 3 }, { n: 9, c: 32, r: 11 },
  ],
};

const setLabels = ["A", "B", "C", "D", "E"];

const colorForNumber = (number) => {
  if (number <= 10) return "ball-yellow";
  if (number <= 20) return "ball-blue";
  if (number <= 30) return "ball-red";
  if (number <= 40) return "ball-gray";
  return "ball-green";
};

const ballFill = (number) => {
  if (number <= 10) return "#f7c948";
  if (number <= 20) return "#58a6ff";
  if (number <= 30) return "#ff647c";
  if (number <= 40) return "#a6adbb";
  return "#47d18c";
};

const buildProfiles = () =>
  Array.from({ length: 45 }, (_, index) => {
    const number = index + 1;
    const frequency = LOTTO_STATS.frequency[index];
    const bonusFrequency = LOTTO_STATS.bonusFrequency[index];
    const recency = LOTTO_STATS.recency[index];
    const hotScore = frequency * 1.25 + bonusFrequency * 0.3 + Math.max(0, 20 - recency) * 0.25;
    return { number, frequency, bonusFrequency, recency, hotScore };
  }).sort((a, b) => b.hotScore - a.hotScore);

const weightedPick = (pool, selected) => {
  const candidates = pool.filter((item) => !selected.has(item.number));
  const totalWeight = candidates.reduce((sum, item) => sum + item.hotScore, 0);
  let cursor = Math.random() * totalWeight;

  for (const item of candidates) {
    cursor -= item.hotScore;
    if (cursor <= 0) return item.number;
  }

  return candidates.at(-1).number;
};

const zoneCounts = (numbers) => {
  const zones = [0, 0, 0, 0, 0];
  numbers.forEach((number) => {
    zones[Math.min(4, Math.floor((number - 1) / 10))] += 1;
  });
  return zones;
};

const countConsecutive = (numbers) => {
  let count = 0;
  for (let index = 1; index < numbers.length; index += 1) {
    if (numbers[index] === numbers[index - 1] + 1) count += 1;
  }
  return count;
};

const scoreSet = (numbers) => {
  const sum = numbers.reduce((total, number) => total + number, 0);
  const odd = numbers.filter((number) => number % 2).length;
  const zones = zoneCounts(numbers);
  const consecutive = countConsecutive(numbers);
  const frequencyScore = numbers.reduce((total, number) => total + LOTTO_STATS.frequency[number - 1], 0) / 2.7;
  const balanceScore = [2, 3, 4].includes(odd) ? 18 : 4;
  const sumScore = sum >= 110 && sum <= 170 ? 18 : sum >= 90 && sum <= 190 ? 10 : -10;
  const zoneScore = zones.filter(Boolean).length >= 4 && Math.max(...zones) <= 2 ? 18 : 6;
  const consecutiveScore = consecutive <= 1 ? 12 : -8;
  return Math.round(frequencyScore + balanceScore + sumScore + zoneScore + consecutiveScore);
};

const passesFilters = (numbers) => {
  const sum = numbers.reduce((total, number) => total + number, 0);
  const odd = numbers.filter((number) => number % 2).length;
  const zones = zoneCounts(numbers);
  return sum >= 90 && sum <= 190 && odd >= 2 && odd <= 4 && zones.filter(Boolean).length >= 4 && Math.max(...zones) <= 2 && countConsecutive(numbers) <= 1;
};

const createSmartSet = (profiles) => {
  const hotPool = profiles.slice(0, 15);
  const midPool = profiles.slice(15, 33);
  const coldPool = profiles.slice(33);
  const attempts = [];

  for (let attempt = 0; attempt < 900; attempt += 1) {
    const selected = new Set();
    [hotPool, hotPool, hotPool, midPool, midPool, coldPool].forEach((pool) => {
      selected.add(weightedPick(pool, selected));
    });
    const numbers = [...selected].sort((a, b) => a - b);
    if (numbers.length === 6 && passesFilters(numbers)) attempts.push({ numbers, score: scoreSet(numbers) });
  }

  return attempts.sort((a, b) => b.score - a.score)[0] ?? { numbers: [3, 6, 13, 30, 35, 45], score: 88 };
};

const useCanvasBalls = (canvasRef, profiles) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    const balls = [];
    let frameId = 0;

    const resizeCanvas = () => {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.floor(window.innerWidth * ratio);
      canvas.height = Math.floor(window.innerHeight * ratio);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

      balls.length = 0;
      const count = window.innerWidth < 760 ? 24 : 38;
      for (let index = 0; index < count; index += 1) {
        const value = profiles[Math.floor(Math.random() * 18)].number;
        balls.push({
          value,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          radius: 22 + Math.random() * 52,
          speed: 0.14 + Math.random() * 0.36,
          phase: Math.random() * Math.PI * 2,
          alpha: 0.34 + Math.random() * 0.36,
        });
      }
    };

    const animateCanvas = (time) => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      balls.forEach((ball) => {
        const floatX = Math.sin(time * 0.0004 + ball.phase) * 16;
        ball.y -= ball.speed;
        if (ball.y + ball.radius < -40) {
          ball.y = window.innerHeight + ball.radius + Math.random() * 120;
          ball.x = Math.random() * window.innerWidth;
        }
        const x = ball.x + floatX;
        const gradient = ctx.createRadialGradient(x - ball.radius * 0.28, ball.y - ball.radius * 0.35, ball.radius * 0.1, x, ball.y, ball.radius);
        gradient.addColorStop(0, "rgba(255,255,255,0.92)");
        gradient.addColorStop(0.22, ballFill(ball.value));
        gradient.addColorStop(1, "rgba(8,13,28,0.36)");
        ctx.globalAlpha = ball.alpha;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = ball.alpha * 0.82;
        ctx.fillStyle = "#101522";
        ctx.font = `800 ${Math.max(15, ball.radius * 0.38)}px Inter, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(ball.value).padStart(2, "0"), x, ball.y + 1);
      });
      ctx.globalAlpha = 1;
      frameId = requestAnimationFrame(animateCanvas);
    };

    resizeCanvas();
    frameId = requestAnimationFrame(animateCanvas);
    window.addEventListener("resize", resizeCanvas);
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(frameId);
    };
  }, [canvasRef, profiles]);
};

const NumberRow = ({ numbers, className = "" }) => (
  <div className={className}>
    {numbers.map((number) => (
      <span className={colorForNumber(number)} key={number}>
        {String(number).padStart(2, "0")}
      </span>
    ))}
  </div>
);

export default function Home() {
  const canvasRef = useRef(null);
  const profiles = useMemo(() => buildProfiles(), []);
  const [sets, setSets] = useState(() => Array.from({ length: 5 }, () => createSmartSet(profiles)));
  const [rolling, setRolling] = useState(false);
  const firstSet = sets[0];
  const odd = firstSet.numbers.filter((number) => number % 2).length;
  const sum = firstSet.numbers.reduce((total, number) => total + number, 0);

  useCanvasBalls(canvasRef, profiles);

  useEffect(() => {
    const revealObserver = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("visible")),
      { threshold: 0.22 }
    );
    document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
    return () => revealObserver.disconnect();
  }, []);

  const generateNumbers = () => {
    if (rolling) return;
    setRolling(true);
    let ticks = 0;
    const timer = window.setInterval(() => {
      ticks += 1;
      setSets(Array.from({ length: 5 }, () => createSmartSet(profiles)));
      if (ticks >= 12) {
        window.clearInterval(timer);
        setSets(Array.from({ length: 5 }, () => createSmartSet(profiles)));
        setRolling(false);
      }
    }, 55);
  };

  const scrollToStart = () => document.querySelector("#start")?.scrollIntoView({ behavior: "smooth" });

  return (
    <>
      <header className="site-header" aria-label="상단 내비게이션">
        <a className="brand" href="#top" aria-label="LOTTO V2 홈">
          <span className="brand-mark">7</span>
          <span>LOTTO V2</span>
        </a>
        <nav className="nav-links" aria-label="주요 메뉴">
          <a href="#insight">분석</a>
          <a href="#start">추천기</a>
          <a href="#flow">로직</a>
        </nav>
        <button className="header-action" type="button" onClick={scrollToStart}>번호 뽑기</button>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <canvas id="lottoCanvas" ref={canvasRef} aria-hidden="true" />
          <div className="hero-content">
            <p className="eyebrow">5 YEAR DATA MODEL</p>
            <h1 id="hero-title">LOTTO<br />V2</h1>
            <p className="hero-copy">최근 5년간 실제 1등 번호 260회차를 분석해 빈도, 최근성, 합계, 홀짝, 구간 분포를 반영한 추천 조합을 생성합니다.</p>
            <div className="hero-actions">
              <button className="primary-button" type="button" disabled={rolling} onClick={generateNumbers}>
                {rolling ? "분석 중" : "통계 추천 번호 생성"}
              </button>
              <a className="text-link" href="#insight">분석 보기</a>
            </div>
          </div>
          <div className="draw-panel" aria-label="오늘의 추천 번호">
            <span className="panel-label">MODEL PICK</span>
            <NumberRow className={`number-row ${rolling ? "rolling" : "settled"}`} numbers={firstSet.numbers} />
            <p>합계 {sum}, 홀짝 {odd}:{6 - odd}, 모델 점수 {firstSet.score}</p>
          </div>
        </section>

        <div className="red-band" aria-hidden="true" />

        <section className="section intro" id="insight" aria-labelledby="insight-title">
          <div>
            <p className="eyebrow">NUMBER INSIGHT</p>
            <h2 id="insight-title">실제 5년 데이터를 반영했습니다</h2>
          </div>
          <p>
            데이터 범위는 <strong>{LOTTO_STATS.range}</strong>, 최신 확인 회차는 <strong>{LOTTO_STATS.latestRound}회</strong>입니다.
            로또는 독립 시행이라 당첨 보장은 불가능하지만, 극단 조합을 줄이고 과거에 자주 나타난 구조를 우선하도록 설계했습니다.
          </p>
        </section>

        <section className="metrics" aria-label="5년 분석 지표">
          <article className="metric reveal">
            <span className="metric-value">{LOTTO_STATS.drawCount}</span>
            <h3>분석 회차</h3>
            <p>2021년 5월 이후 실제 1등 번호만 사용했습니다.</p>
          </article>
          <article className="metric reveal">
            <span className="metric-value">{LOTTO_STATS.top[0].n}</span>
            <h3>최다 출현 번호</h3>
            <p>5년간 {LOTTO_STATS.top[0].c}회 출현했습니다.</p>
          </article>
          <article className="metric reveal">
            <span className="metric-value">3:3</span>
            <h3>주요 홀짝 균형</h3>
            <p>3:3, 4:2, 2:4 조합에 높은 점수를 줍니다.</p>
          </article>
        </section>

        <section className="analysis-panel section" aria-label="핫 번호와 콜드 번호">
          <div>
            <h3>HOT 번호</h3>
            <p>최근 5년 출현 빈도와 최근 출현 흐름이 높은 번호입니다.</p>
            <div className="chip-row">
              {LOTTO_STATS.top.map((item) => <span className={`number-chip ${colorForNumber(item.n)}`} key={item.n}>{String(item.n).padStart(2, "0")} · {item.c}회</span>)}
            </div>
          </div>
          <div>
            <h3>COLD 번호</h3>
            <p>같은 기간 출현 빈도가 낮았거나 공백이 길었던 번호입니다.</p>
            <div className="chip-row">
              {LOTTO_STATS.cold.map((item) => <span className={`number-chip ${colorForNumber(item.n)}`} key={item.n}>{String(item.n).padStart(2, "0")} · {item.c}회</span>)}
            </div>
          </div>
        </section>

        <section className="generator-section" id="start" aria-labelledby="generator-title">
          <div className="generator-copy">
            <p className="eyebrow">SMART GENERATOR</p>
            <h2 id="generator-title">5세트 통계 추천</h2>
            <p>빈도 가중치로 후보를 뽑고, 합계 90~190, 홀짝 2:4~4:2, 5개 구간 분산, 연속번호 0~1개 조건을 통과한 조합만 보여줍니다.</p>
          </div>
          <div className="generator">
            <div className="generator-top">
              <span className="panel-label">RECOMMENDED SETS</span>
              <button className="ghost-button" type="button" disabled={rolling} onClick={generateNumbers}>
                {rolling ? "분석 중" : "다시 생성"}
              </button>
            </div>
            <div className={`set-list ${rolling ? "rolling" : "settled"}`} aria-live="polite">
              {sets.map((set, index) => (
                <div className="set-item" key={`${index}-${set.numbers.join("-")}`}>
                  <strong>{setLabels[index]}</strong>
                  <NumberRow className="big-number-row" numbers={set.numbers} />
                </div>
              ))}
            </div>
            <div className="balance">
              <div><span>홀수</span><strong>{odd}</strong></div>
              <div><span>짝수</span><strong>{6 - odd}</strong></div>
              <div><span>합계</span><strong>{sum}</strong></div>
              <div><span>점수</span><strong>{firstSet.score}</strong></div>
            </div>
          </div>
        </section>

        <section className="flow" id="flow" aria-labelledby="flow-title">
          <p className="eyebrow">HOW IT WORKS</p>
          <h2 id="flow-title">추천 로직</h2>
          <div className="flow-list">
            <div className="flow-item reveal"><span>01</span><p>최근 5년 1등 번호의 출현 빈도, 보너스 빈도, 미출현 기간을 번호별 점수로 환산합니다.</p></div>
            <div className="flow-item reveal"><span>02</span><p>HOT 3개, MID 2개, COLD 1개 비율로 섞어 한쪽으로 치우친 조합을 피합니다.</p></div>
            <div className="flow-item reveal"><span>03</span><p>홀짝, 합계, 구간 분산, 연속번호 조건을 통과한 후보 중 점수가 높은 5세트를 출력합니다.</p></div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <strong>LOTTO V2</strong>
        <span>추천 번호는 당첨을 보장하지 않습니다. 모든 조합의 1등 확률은 동일하며 건전한 구매를 권장합니다.</span>
      </footer>
    </>
  );
}
