'use client';

import React, { useState, useEffect } from 'react';
import { Train, Play, Square, AlertTriangle, RefreshCw, ArrowUpDown, Moon, Sun, ShieldCheck } from 'lucide-react';
import DelayModal from '@/components/DelayModal';

const SUBWAY_STATIONS: Record<string, string[]> = {
  "2호선": [
    "시청", "을지로입구", "을지로3가", "을지로4가", "동대문역사문화공원", "신당", "상왕십리", 
    "왕십리", "한양대", "뚝섬", "성수", "건대입구", "구의", "강변", "잠실나루", "잠실", 
    "잠실새내", "종합운동장", "삼성", "선릉", "역삼", "강남", "교대", "서초", "방배", 
    "사당", "낙성대", "서울대입구", "봉천", "신림", "신대방", "구로디지털단지", "대림", 
    "신도림", "문래", "영등포구청", "당산", "합정", "홍대입구", "신촌", "이대", "아현", "충정로"
  ],
  "경의중앙선": [
    "문산", "파주", "금촌", "금릉", "운정", "야당", "탄현", "일산", "백마", "곡산", 
    "대곡", "능곡", "행신", "화전", "수색", "디지털미디어시티", "가좌", "신촌", 
    "공덕", "용산", "이촌", "서빙고", "한남", "옥수", "응봉", "왕십리", "청량리", 
    "회기", "중랑", "상봉", "망우", "구리", "도농", "양정", "덕소", "팔당", "운길산", "양수"
  ]
};

export default function Home() {
  const [selectedLine, setSelectedLine] = useState<'2호선' | '경의중앙선'>('2호선');
  const [isBoarded, setIsBoarded] = useState(false);
  const [startStation, setStartStation] = useState('강남');
  const [endStation, setEndStation] = useState('홍대입구');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // 정차 타이머 및 API 상태
  const [isStationary, setIsStationary] = useState(false);
  const [delaySeconds, setDelaySeconds] = useState(0);
  const [isDelayConfirmed, setIsDelayConfirmed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiData, setApiData] = useState<any[]>([]);

  // 노선 변경 처리
  const handleLineChange = (line: '2호선' | '경의중앙선') => {
    setSelectedLine(line);
    if (line === '2호선') {
      setStartStation('강남');
      setEndStation('홍대입구');
    } else {
      setStartStation('디지털미디어시티');
      setEndStation('공덕');
    }
  };

  // 출발역 <-> 도착역 반대로 스와프
  const handleSwapStations = () => {
    if (isBoarded) return;
    const temp = startStation;
    setStartStation(endStation);
    setEndStation(temp);
  };

  const fetchSubwayData = async () => {
    try {
      const res = await fetch(`/api/subway?line=${encodeURIComponent(selectedLine)}`);
      const json = await res.json();
      if (json.realtimePosition) {
        setApiData(json.realtimePosition);
      }
    } catch (e) {
      console.error('API Fetch Error:', e);
    }
  };

  useEffect(() => {
    fetchSubwayData();
  }, [selectedLine]);

  // 정차 감지 타이머 (3분 = 180초)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isBoarded && isStationary) {
      timer = setInterval(() => {
        setDelaySeconds((prev) => {
          const next = prev + 1;
          if (next >= 180 && !isDelayConfirmed) {
            setIsDelayConfirmed(true);
          }
          return next;
        });
      }, 1000);
    } else {
      setDelaySeconds(0);
    }
    return () => clearInterval(timer);
  }, [isBoarded, isStationary, isDelayConfirmed]);

  const handleStartBoarding = () => {
    setIsBoarded(true);
    setIsDelayConfirmed(false);
    setDelaySeconds(0);
  };

  const handleEndBoarding = () => {
    setIsBoarded(false);
    setIsStationary(false);
    if (isDelayConfirmed) {
      setIsModalOpen(true);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}분 ${s < 10 ? '0' : ''}${s}초`;
  };

  return (
    <main className={`min-h-screen w-full flex flex-col items-center justify-center p-4 ${isDarkMode ? 'dark bg-slate-900 text-slate-100' : 'bg-[#f2f4f6] text-[#191f28]'}`}>
      <div className="w-full max-w-md bg-white dark:bg-slate-800 shadow-xl rounded-3xl overflow-hidden border border-slate-200/60 dark:border-slate-700/60 p-6 space-y-6">
        
        {/* Top Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Train className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">왜멈추니</h1>
              <p className="text-xs text-slate-400 font-medium">지하철 실시간 정차 감지기</p>
            </div>
          </div>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Line Selector (Toss Tab Style) */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-700/50 rounded-2xl">
          <button
            onClick={() => handleLineChange('2호선')}
            disabled={isBoarded}
            className={`py-2.5 text-xs font-bold rounded-xl transition ${
              selectedLine === '2호선'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            } disabled:opacity-40`}
          >
            2호선
          </button>
          <button
            onClick={() => handleLineChange('경의중앙선')}
            disabled={isBoarded}
            className={`py-2.5 text-xs font-bold rounded-xl transition ${
              selectedLine === '경의중앙선'
                ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            } disabled:opacity-40`}
          >
            경의중앙선
          </button>
        </div>

        {/* Station Selection Box with Swap Button */}
        <div className="relative bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
          <div className="flex flex-col gap-3">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">출발역</span>
              <select
                value={startStation}
                onChange={(e) => setStartStation(e.target.value)}
                disabled={isBoarded}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-blue-500 disabled:opacity-50"
              >
                {SUBWAY_STATIONS[selectedLine].map((st) => (
                  <option key={st} value={st}>{st}역</option>
                ))}
              </select>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">도착역</span>
              <select
                value={endStation}
                onChange={(e) => setEndStation(e.target.value)}
                disabled={isBoarded}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-blue-500 disabled:opacity-50"
              >
                {SUBWAY_STATIONS[selectedLine].map((st) => (
                  <option key={st} value={st}>{st}역</option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSwapStations}
            disabled={isBoarded}
            title="출발역과 도착역 반대로 바꾸기"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 shadow-md hover:scale-105 active:scale-95 transition disabled:opacity-30 cursor-pointer"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>

        {/* Boarding Controls */}
        {!isBoarded ? (
          <button
            onClick={handleStartBoarding}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition active:scale-[0.98] cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" /> 탑승 시작하기
          </button>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 p-4 rounded-2xl text-center">
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center justify-center gap-1.5 mb-1">
                <ShieldCheck className="w-4 h-4" /> 실시간 센서 감지 중
              </p>
              <p className="text-sm font-extrabold">[{selectedLine}] {startStation} ➔ {endStation}</p>
            </div>

            {/* 정차 시뮬레이터 */}
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 p-4 rounded-2xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-amber-500" /> 터널 정차 시뮬레이터
                </span>
                <input 
                  type="checkbox" 
                  checked={isStationary} 
                  onChange={(e) => setIsStationary(e.target.checked)}
                  className="w-5 h-5 accent-blue-600 cursor-pointer"
                />
              </div>
              {isStationary && (
                <div className="text-center pt-2 border-t border-amber-200/60 dark:border-amber-900/40">
                  <p className="text-xs text-amber-800 dark:text-amber-300">정차 지속: <span className="font-mono font-bold text-sm">{formatTime(delaySeconds)}</span></p>
                  {isDelayConfirmed && (
                    <p className="text-xs font-extrabold text-rose-600 dark:text-rose-400 mt-1 animate-bounce">🚨 3분 초과 비정상 지연 확정!</p>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleEndBoarding}
              className="w-full bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition active:scale-[0.98] cursor-pointer"
            >
              <Square className="w-5 h-5 fill-current" /> 하차 완료 (증명서 확인)
            </button>
          </div>
        )}

        {/* Realtime API Monitor */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-400">실시간 공공 API ({selectedLine})</span>
            <button onClick={fetchSubwayData} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
            {apiData.map((train, idx) => (
              <div key={idx} className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/60 px-3 py-2 rounded-xl text-xs flex justify-between items-center">
                <span className="font-bold">{train.trainNo}호 열차</span>
                <span className="text-slate-400 font-medium">{train.statnNm}역 ({train.statnTcv === '1' ? '정차' : '주행'})</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <DelayModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        line={selectedLine}
        startStation={startStation}
        endStation={endStation}
        delayMinutes={Math.ceil(delaySeconds / 60)}
      />
    </main>
  );
}
