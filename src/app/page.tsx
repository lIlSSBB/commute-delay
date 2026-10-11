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

  // 노선 변경
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

  // 출발역 <-> 도착역 상호 전환
  const handleSwapStations = () => {
    if (isBoarded) return;
    setStartStation(endStation);
    setEndStation(startStation);
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

  // 정차 타이머 (3분 = 180초)
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
      style={{ backgroundColor: '#f2f4f6', color: '#191f28', padding: '20px' }}
    >
      <div 
        className="w-full max-w-md bg-white rounded-3xl p-6 space-y-5"
        style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '24px', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          width: '100%',
          maxWidth: '420px',
          boxSizing: 'border-box'
        }}
      >
        
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #f2f4f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div 
              style={{ width: '40px', height: '40px', borderRadius: '14px', backgroundColor: '#e8f3ff', color: '#3182f6', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontWeight: 'bold' }}
            >
              <Train className="w-5 h-5" style={{ margin: 'auto' }} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' }}>왜멈추니</h1>
              <p style={{ margin: 0, fontSize: '12px', color: '#8b95a1', fontWeight: '500' }}>실시간 터널 정차 감지기</p>
            </div>
          </div>
          <span style={{ backgroundColor: '#f2f4f6', color: '#6b7684', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px' }}>
            v1.3 Live
          </span>
        </div>

        {/* Line Tabs */}
        <div 
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '4px', backgroundColor: '#f2f4f6', borderRadius: '16px', gap: '4px' }}
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
              cursor: isBoarded ? 'not-allowed' : 'pointer',
              backgroundColor: selectedLine === '2호선' ? '#ffffff' : 'transparent',
              color: selectedLine === '2호선' ? '#3182f6' : '#8b95a1',
              boxShadow: selectedLine === '2호선' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s'
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
              cursor: isBoarded ? 'not-allowed' : 'pointer',
              backgroundColor: selectedLine === '경의중앙선' ? '#ffffff' : 'transparent',
              color: selectedLine === '경의중앙선' ? '#00a389' : '#8b95a1',
              boxShadow: selectedLine === '경의중앙선' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            경의중앙선
          </button>
        </div>

        {/* Station Selection Box with Swap Button */}
        <div 
          style={{ 
            position: 'relative', 
            padding: '16px', 
            backgroundColor: '#f9fafb', 
            border: '1px solid #f2f4f6', 
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ flex: 1, paddingRight: '50px' }}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#8b95a1', marginBottom: '4px' }}>출발역</label>
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
                  fontWeight: '700',
                  fontSize: '14px',
                  color: '#191f28',
                  outline: 'none'
                }}
              >
                {SUBWAY_STATIONS[selectedLine].map((st) => (
                  <option key={st} value={st}>{st}역</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#8b95a1', marginBottom: '4px' }}>도착역</label>
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
                  fontWeight: '700',
                  fontSize: '14px',
                  color: '#191f28',
                  outline: 'none'
                }}
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
            title="출발역과 도착역 상호 전환"
            style={{
              position: 'absolute',
              right: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              border: '1px solid #e5e8eb',
              backgroundColor: '#ffffff',
              color: '#3182f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              cursor: isBoarded ? 'not-allowed' : 'pointer',
              opacity: isBoarded ? 0.4 : 1
            }}
          >
            <ArrowUpDown className="w-5 h-5" />
          </button>
        </div>

        {/* Boarding Controls */}
        {!isBoarded ? (
          <button
            onClick={handleStartBoarding}
            style={{
              width: '100%',
              backgroundColor: '#3182f6',
              color: '#ffffff',
              fontWeight: '700',
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div 
              style={{ backgroundColor: '#e8f3ff', border: '1px solid #cce3ff', borderRadius: '16px', padding: '14px', textAlign: 'center' }}
            >
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: '700', color: '#3182f6', display: 'flex', alignItems: 'center', justifyCenter: 'center', gap: '4px' }}>
                <ShieldCheck className="w-4 h-4" /> 실시간 센서 주행 감지 중
              </p>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#1b4b91' }}>[{selectedLine}] {startStation} ➔ {endStation}</p>
            </div>

            {/* 정차 시뮬레이터 */}
            <div 
              style={{ backgroundColor: '#fff8e6', border: '1px solid #ffe8b3', borderRadius: '16px', padding: '14px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#b45309', display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                <div style={{ textAlign: 'center', paddingTop: '8px', marginTop: '8px', borderTop: '1px solid #ffe8b3' }}>
                  <p style={{ margin: 0, fontSize: '12px', color: '#78350f' }}>정차 지속: <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{formatTime(delaySeconds)}</span></p>
                  {isDelayConfirmed && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', fontWeight: '800', color: '#e11
