'use client';

import React, { useState, useEffect } from 'react';
import { Train, Play, Square, AlertTriangle, RefreshCw, ArrowUpDown, ShieldCheck, Sun, Moon, Monitor } from 'lucide-react';
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
  const [direction, setDirection] = useState<'내선' | '외선' | '상행' | '하행'>('내선');
  const [isBoarded, setIsBoarded] = useState(false);
  const [startStation, setStartStation] = useState('강남');
  const [endStation, setEndStation] = useState('홍대입구');
  
  const [isStationary, setIsStationary] = useState(false);
  const [delaySeconds, setDelaySeconds] = useState(0);
  const [isDelayConfirmed, setIsDelayConfirmed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiData, setApiData] = useState<any[]>([]);

  // 테마 모드 ('light' | 'dark' | 'system')
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = (mode: 'light' | 'dark') => {
      if (mode === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches ? 'dark' : 'light');
      const listener = (e: MediaQueryListEvent) => applyTheme(e.matches ? 'dark' : 'light');
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    } else {
      applyTheme(themeMode);
    }
  }, [themeMode]);

  const lineThemeColor = selectedLine === '2호선' ? '#00A84D' : '#77C4A3';

  const handleLineChange = (line: '2호선' | '경의중앙선') => {
    setSelectedLine(line);
    if (line === '2호선') {
      setDirection('내선');
      setStartStation('강남');
      setEndStation('홍대입구');
    } else {
      setDirection('상행');
      setStartStation('디지털미디어시티');
      setEndStation('공덕');
    }
  };

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
    <main className="min-h-screen w-full flex flex-col items-center justify-center p-4 transition-colors duration-200">
      <div 
        className="w-full max-w-md shadow-xl p-6 space-y-5 transition-colors duration-200"
        style={{ 
          backgroundColor: 'var(--card-bg)', 
          color: 'var(--text-primary)', 
          borderRadius: '24px', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)' 
        }}
      >
        {/* Header & Theme Toggle */}
        <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-2.5">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: lineThemeColor }}
            >
              <Train className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight" style={{ margin: 0, fontSize: '20px' }}>왜멈추니</h1>
              <p className="text-xs font-medium opacity-60" style={{ margin: 0, fontSize: '12px' }}>실시간 터널 정차 감지기</p>
            </div>
          </div>

          {/* Theme Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-neutral-800">
            <button
              onClick={() => setThemeMode('light')}
              title="라이트 모드"
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${themeMode === 'light' ? 'bg-white text-black shadow-sm' : 'opacity-40'}`}
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setThemeMode('system')}
              title="시스템 설정 반영"
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${themeMode === 'system' ? 'bg-white text-black shadow-sm' : 'opacity-40'}`}
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setThemeMode('dark')}
              title="다크 모드"
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${themeMode === 'dark' ? 'bg-neutral-900 text-white shadow-sm' : 'opacity-40'}`}
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Line Tabs */}
        <div className="grid grid-cols-2 p-1.5 gap-1 bg-gray-100 dark:bg-neutral-800 rounded-2xl">
          <button
            onClick={() => handleLineChange('2호선')}
            disabled={isBoarded}
            style={{
              padding: '10px 0',
              borderRadius: '12px',
              border: 'none',
              fontWeight: 'bold',
              fontSize: '13px',
              cursor: 'pointer',
              backgroundColor: selectedLine === '2호선' ? 'var(--card-bg)' : 'transparent',
              color: selectedLine === '2호선' ? '#00A84D' : 'var(--text-secondary)',
              boxShadow: selectedLine === '2호선' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            2호선
          </button>
          <button
            onClick={() => handleLineChange('경의중앙선')}
            disabled={isBoarded}
            style={{
              padding: '10px 0',
              borderRadius: '12px',
              border: 'none',
              fontWeight: 'bold',
              fontSize: '13px',
              cursor: 'pointer',
              backgroundColor: selectedLine === '경의중앙선' ? 'var(--card-bg)' : 'transparent',
              color: selectedLine === '경의중앙선' ? '#77C4A3' : 'var(--text-secondary)',
              boxShadow: selectedLine === '경의중앙선' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            경의중앙선
          </button>
        </div>

        {/* Direction Selection (내선/외선 혹은 상행/하행) */}
        <div className="flex gap-2">
          {selectedLine === '2호선' ? (
            <>
              <button
                onClick={() => setDirection('내선')}
                disabled={isBoarded}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${direction === '내선' ? 'border-[#00A84D] bg-[#00A84D]/10 text-[#00A84D]' : 'opacity-50 border-gray-200 dark:border-neutral-700'}`}
              >
                🔄 2호선 내선순환
              </button>
              <button
                onClick={() => setDirection('외선')}
                disabled={isBoarded}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${direction === '외선' ? 'border-[#00A84D] bg-[#00A84D]/10 text-[#00A84D]' : 'opacity-50 border-gray-200 dark:border-neutral-700'}`}
              >
                🔃 2호선 외선순환
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setDirection('상행')}
                disabled={isBoarded}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${direction === '상행' ? 'border-[#77C4A3] bg-[#77C4A3]/10 text-[#77C4A3]' : 'opacity-50 border-gray-200 dark:border-neutral-700'}`}
              >
                ⬆️ 경의중앙선 상행
              </button>
              <button
                onClick={() => setDirection('하행')}
                disabled={isBoarded}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${direction === '하행' ? 'border-[#77C4A3] bg-[#77C4A3]/10 text-[#77C4A3]' : 'opacity-50 border-gray-200 dark:border-neutral-700'}`}
              >
                ⬇️ 경의중앙선 하행
              </button>
            </>
          )}
        </div>

        {/* Station Selection Box + Swap Button */}
        <div className="relative p-4 space-y-3 bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl">
          <div className="space-y-3" style={{ paddingRight: '40px' }}>
            <div>
              <label className="text-xs font-bold opacity-60 block mb-1">출발역</label>
              <select
                value={startStation}
                onChange={(e) => setStartStation(e.target.value)}
                disabled={isBoarded}
                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-bold text-sm"
              >
                {SUBWAY_STATIONS[selectedLine].map((st) => (
                  <option key={st} value={st}>{st}역</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold opacity-60 block mb-1">도착역</label>
              <select
                value={endStation}
                onChange={(e) => setEndStation(e.target.value)}
                disabled={isBoarded}
                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-bold text-sm"
              >
                {SUBWAY_STATIONS[selectedLine].map((st) => (
                  <option key={st} value={st}>{st}역</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleSwapStations}
            disabled={isBoarded}
            title="출발역과 도착역 상호 전환"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 flex items-center justify-center shadow-md cursor-pointer disabled:opacity-30"
            style={{ color: lineThemeColor }}
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>

        {/* Boarding Controls */}
        {!isBoarded ? (
          <button
            onClick={handleStartBoarding}
            className="w-full text-white font-bold py-4 rounded-2xl border-none text-base cursor-pointer shadow-lg flex items-center justify-center gap-2 transition-all"
            style={{ backgroundColor: lineThemeColor }}
          >
            <Play className="w-5 h-5 fill-current" /> 탑승 시작하기 ({direction})
          </button>
        ) : (
          <div className="space-y-3">
            <div className="p-4 text-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1 mb-1">
                <ShieldCheck className="w-4 h-4" /> 실시간 센서 주행 감지 중 ({direction})
              </p>
              <p className="text-sm font-extrabold text-emerald-900 dark:text-emerald-200">[{selectedLine}] {startStation} ➔ {endStation}</p>
            </div>

            <div className="p-4 space-y-2 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-amber-600" /> 터널 정차 시뮬레이터
                </span>
                <input 
                  type="checkbox" 
                  checked={isStationary} 
                  onChange={(e) => setIsStationary(e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                />
              </div>
              {isStationary && (
                <div className="text-center pt-2 border-t border-amber-200 dark:border-amber-900">
                  <p className="text-xs text-amber-900 dark:text-amber-300">정차 지속: <span className="font-mono font-bold">{formatTime(delaySeconds)}</span></p>
                  {isDelayConfirmed && (
                    <p className="text-xs font-extrabold text-rose-600 mt-1">🚨 3분 초과 비정상 지연 확정!</p>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleEndBoarding}
              className="w-full bg-neutral-900 dark:bg-neutral-800 text-white font-bold py-4 rounded-2xl border-none text-base cursor-pointer flex items-center justify-center gap-2"
            >
              <Square className="w-5 h-5 fill-current" /> 하차 완료 (증명서 확인)
            </button>
          </div>
        )}

        {/* Realtime API Monitor */}
        <div className="pt-3 border-t border-gray-100 dark:border-neutral-800">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold opacity-60">실시간 공공 API ({selectedLine} · {direction})</span>
            <button onClick={fetchSubwayData} className="border-none bg-transparent cursor-pointer opacity-60 hover:opacity-100">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
            {apiData.map((train, idx) => (
              <div 
                key={idx} 
                className="px-3 py-2 text-xs flex justify-between items-center bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-xl"
              >
                <span className="font-bold">{train.trainNo}호 열차</span>
                <span className="opacity-70">{train.statnNm}역 ({train.statnTcv === '1' ? '정차' : '주행'})</span>
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
