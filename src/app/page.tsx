'use client';

import React, { useState, useEffect } from 'react';
import { Train, Play, Square, AlertTriangle, RefreshCw } from 'lucide-react';
import DelayModal from '@/components/DelayModal';

export default function Home() {
  const [isBoarded, setIsBoarded] = useState(false);
  const [startStation, setStartStation] = useState('디지털미디어시티');
  const [endStation, setEndStation] = useState('홍대입구');
  
  // 상태 관리
  const [isStationary, setIsStationary] = useState(false);
  const [delaySeconds, setDelaySeconds] = useState(0);
  const [isDelayConfirmed, setIsDelayConfirmed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiData, setApiData] = useState<any[]>([]);

  const fetchSubwayData = async () => {
    try {
      const res = await fetch('/api/subway?line=경의중앙선');
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
  }, []);

  // 3분(180초) 정차 타이머 시뮬레이션
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
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-start p-4 text-slate-900 w-full">
      <div className="w-full max-w-md bg-white shadow-xl rounded-3xl overflow-hidden border border-slate-100 mt-6 flex flex-col min-h-[80vh]">
        
        {/* Header */}
        <div className="bg-teal-700 text-white p-6 rounded-b-3xl shadow-md">
          <div className="flex justify-between items-center mb-2">
            <span className="bg-teal-600/80 text-teal-100 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
              경의중앙선 전용
            </span>
            <span className="text-xs text-teal-200">Mock API Mode</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Train className="w-7 h-7" /> 서브웨이 가디언
          </h1>
          <p className="text-teal-100 text-xs mt-1">터널 내 신호대기·지연 감지 및 실시간 지증 자동 발급</p>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 flex flex-col gap-5">
          
          {/* Station Selection */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-500 uppercase">출발역</label>
              <input 
                type="text" 
                value={startStation} 
                onChange={(e) => setStartStation(e.target.value)}
                disabled={isBoarded}
                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-right w-44 focus:outline-teal-600 disabled:bg-slate-100"
              />
            </div>
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-500 uppercase">도착역</label>
              <input 
                type="text" 
                value={endStation} 
                onChange={(e) => setEndStation(e.target.value)}
                disabled={isBoarded}
                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-right w-44 focus:outline-teal-600 disabled:bg-slate-100"
              />
            </div>
          </div>

          {/* Boarding Status & Controls */}
          {!isBoarded ? (
            <button
              onClick={handleStartBoarding}
              className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-4 rounded-2xl shadow-lg shadow-teal-700/20 flex items-center justify-center gap-2 transition active:scale-[0.98]"
            >
              <Play className="w-5 h-5 fill-current" /> 탑승 시작하기
            </button>
          ) : (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-teal-50 border border-teal-200 p-4 rounded-2xl text-center space-y-1">
                <p className="text-xs font-semibold text-teal-700">🟢 실시간 센서 및 공공 API 연동 감지 중</p>
                <p className="text-sm font-bold text-teal-900">{startStation} ➔ {endStation} 구간 주행 중</p>
              </div>

              {/* 3-Minute Simulation Toggle */}
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> [테스트용] 터널 정차 시뮬레이터
                  </span>
                  <input 
                    type="checkbox" 
                    checked={isStationary} 
                    onChange={(e) => setIsStationary(e.target.checked)}
                    className="w-5 h-5 accent-amber-600 cursor-pointer"
                  />
                </div>
                {isStationary && (
                  <div className="text-center pt-1 border-t border-amber-200/60">
                    <p className="text-xs text-amber-700">정차 지속 시간: <span className="font-mono font-bold">{formatTime(delaySeconds)}</span></p>
                    {isDelayConfirmed && (
                      <p className="text-xs font-bold text-rose-600 mt-1 animate-bounce">🚨 3분 초과 비정상 정차(지연) 판정 완료!</p>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={handleEndBoarding}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 transition active:scale-[0.98]"
              >
                <Square className="w-5 h-5 fill-current" /> 하차 완료 (지증 확인)
              </button>
            </div>
          )}

          {/* Public API Status Preview */}
          <div className="mt-auto pt-4 border-t border-slate-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-400">공공 API 실시간 열차 상태 (Mock)</span>
              <button onClick={fetchSubwayData} className="text-slate-400 hover:text-slate-600">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-1.5 max-h-28 overflow-y-auto">
              {apiData.map((train, idx) => (
                <div key={idx} className="bg-slate-50 px-3 py-2 rounded-xl text-xs flex justify-between items-center">
                  <span className="font-semibold text-slate-700">{train.trainNo}호 열차 ({train.subwayNm})</span>
                  <span className="text-slate-500">{train.statnNm}역 ({train.statnTcv === '1' ? '도착/정차' : '출발/이동'})</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Delay Certificate Modal */}
      <DelayModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        line="경의중앙선"
        startStation={startStation}
        endStation={endStation}
        delayMinutes={Math.ceil(delaySeconds / 60)}
      />
    </main>
  );
}
