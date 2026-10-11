'use client';

import React, { useState, useEffect } from 'react';
import { Train, Play, Square, AlertTriangle, RefreshCw, ArrowUpDown, ShieldCheck } from 'lucide-react';
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
  
  const [isStationary, setIsStationary] = useState(false);
  const [delaySeconds, setDelaySeconds] = useState(0);
  const [isDelayConfirmed, setIsDelayConfirmed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiData, setApiData] = useState<any[]>([]);

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
    <main 
      className="min-h-screen w-full flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: '#f2f4f6', color: '#191f28' }}
    >
      <div 
        className="w-full max-w-md shadow-xl p-6 space-y-5"
        style={{ backgroundColor: '#ffffff', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}
      >
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: '#e8f3ff', color: '#3182f6' }}
            >
              <Train className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight" style={{ margin: 0, fontSize: '20px' }}>왜멈추니</h1>
              <p className="text-xs text-gray-400 font-medium" style={{ margin: 0, fontSize: '12px' }}>실시간 터널 정차 감지기</p>
            </div>
          </div>
          <span 
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: '#f2f4f6', color: '#6b7684', fontSize: '11px' }}
          >
            v1.3 Live
          </span>
        </div>

        <div 
          className="grid grid-cols-2 p-1.5 gap-1"
          style={{ backgroundColor: '#f2f4f6', borderRadius: '16px' }}
        >
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
              backgroundColor: selectedLine === '2호선' ? '#ffffff' : 'transparent',
              color: selectedLine === '2호선' ? '#3182f6' : '#8b95a1',
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
              backgroundColor: selectedLine === '경의중앙선' ? '#ffffff' : 'transparent',
              color: selectedLine === '경의중앙선' ? '#00a389' : '#8b95a1',
              boxShadow: selectedLine === '경의중앙선' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            경의중앙선
          </button>
        </div>

        <div 
          className="relative p-4 space-y-3"
          style={{ backgroundColor: '#f9fafb', border: '1px solid #f2f4f6', borderRadius: '18px' }}
        >
          <div className="space-y-3" style={{ paddingRight: '40px' }}>
            <div>
              <label className="text-xs font-bold text-gray-400 block mb-1">출발역</label>
              <select
                value={startStation}
                onChange={(e) => setStartStation(e.target.value)}
                disabled={isBoarded}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  border: '1px solid #e5e8eb',
                  backgroundColor: '#ffffff',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  color: '#191f28'
                }}
              >
                {SUBWAY_STATIONS[selectedLine].map((st) => (
                  <option key={st} value={st}>{st}역</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 block mb-1">도착역</label>
              <select
                value={endStation}
                onChange={(e) => setEndStation(e.target.value)}
                disabled={isBoarded}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  border: '1px solid #e5e8eb',
                  backgroundColor: '#ffffff',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  color: '#191f28'
                }}
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
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '1px solid #e5e8eb',
              backgroundColor: '#ffffff',
              color: '#3182f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
              cursor: isBoarded ? 'not-allowed' : 'pointer',
              opacity: isBoarded ? 0.3 : 1
            }}
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>

        {!isBoarded ? (
          <button
            onClick={handleStartBoarding}
            style={{
              width: '100%',
              backgroundColor: '#3182f6',
              color: '#ffffff',
              fontWeight: 'bold',
              padding: '16px',
              borderRadius: '18px',
              border: 'none',
              fontSize: '16px',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(49, 130, 246, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Play className="w-5 h-5 fill-current" /> 탑승 시작하기
          </button>
        ) : (
          <div className="space-y-3">
            <div 
              className="p-4 text-center"
              style={{ backgroundColor: '#e8f3ff', border: '1px solid #cce3ff', borderRadius: '16px' }}
            >
              <p className="text-xs font-bold text-blue-600 flex items-center justify-center gap-1 mb-1">
                <ShieldCheck className="w-4 h-4" /> 실시간 센서 주행 감지 중
              </p>
              <p className="text-sm font-extrabold text-blue-900">[{selectedLine}] {startStation} ➔ {endStation}</p>
            </div>

            <div 
              className="p-4 space-y-2"
              style={{ backgroundColor: '#fff8e6', border: '1px solid #ffe8b3', borderRadius: '16px' }}
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-amber-600" /> 터널 정차 시뮬레이터
                </span>
                <input 
                  type="checkbox" 
                  checked={isStationary} 
                  onChange={(e) => setIsStationary(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>
              {isStationary && (
                <div className="text-center pt-2 border-t border-amber-200">
                  <p className="text-xs text-amber-900">정차 지속: <span className="font-mono font-bold">{formatTime(delaySeconds)}</span></p>
                  {isDelayConfirmed && (
                    <p className="text-xs font-extrabold text-rose-600 mt-1">🚨 3분 초과 비정상 지연 확정!</p>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleEndBoarding}
              style={{
                width: '100%',
                backgroundColor: '#191f28',
                color: '#ffffff',
                fontWeight: 'bold',
                padding: '16px',
                borderRadius: '18px',
                border: 'none',
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Square className="w-5 h-5 fill-current" /> 하차 완료 (증명서 확인)
            </button>
          </div>
        )}

        <div className="pt-3 border-t border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-gray-400">실시간 공공 API ({selectedLine})</span>
            <button onClick={fetchSubwayData} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#8b95a1' }}>
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
            {apiData.map((train, idx) => (
              <div 
                key={idx} 
                className="px-3 py-2 text-xs flex justify-between items-center"
                style={{ backgroundColor: '#f9fafb', borderRadius: '10px', border: '1px solid #f2f4f6' }}
              >
                <span className="font-bold text-gray-700">{train.trainNo}호 열차</span>
                <span className="text-gray-500">{train.statnNm}역 ({train.statnTcv === '1' ? '정차' : '주행'})</span>
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
