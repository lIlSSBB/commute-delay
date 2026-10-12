'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Train, Play, Square, AlertTriangle, RefreshCw, ArrowUpDown, ShieldCheck, Sun, Moon, Monitor, ArrowRight, Navigation, Cpu } from 'lucide-react';
import DelayModal from '@/components/DelayModal';

// 주요 역 GPS 좌표 데이터셋 (자동 탑승/하차 감지용)
const STATION_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "강남": { lat: 37.4979, lng: 127.0276 },
  "홍대입구": { lat: 37.5575, lng: 126.9245 },
  "신도림": { lat: 37.5087, lng: 126.8912 },
  "삼성": { lat: 37.5088, lng: 127.0632 },
  "디지털미디어시티": { lat: 37.5767, lng: 126.9011 },
  "공덕": { lat: 37.5432, lng: 126.9515 },
  "왕십리": { lat: 37.5612, lng: 127.0371 }
};

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

// 두 좌표 간 거리 계산 (단위: km)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // 지구 반지름
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function Home() {
  const [selectedLine, setSelectedLine] = useState<'2호선' | '경의중앙선'>('2호선');
  const [direction, setDirection] = useState<'내선' | '외선' | '상행' | '하행'>('내선');
  const [isBoarded, setIsBoarded] = useState(false);
  const [startStation, setStartStation] = useState('강남');
  const [endStation, setEndStation] = useState('홍대입구');
  
  // 센서 및 자동 감지 상태
  const [isStationary, setIsStationary] = useState(false);
  const [sensorStatus, setSensorStatus] = useState<string>('센서 대기 중');
  const [userSpeed, setUserSpeed] = useState<number | null>(null);
  const [gpsLocationMsg, setGpsLocationMsg] = useState<string>('위치 추적 오프');

  const [delaySeconds, setDelaySeconds] = useState(0);
  const [isDelayConfirmed, setIsDelayConfirmed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiData, setApiData] = useState<any[]>([]);

  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('system');
  const [isDark, setIsDark] = useState(false);

  // 다크/라이트 테마 제어
  useEffect(() => {
    const root = document.documentElement;
    const updateTheme = (darkMode: boolean) => {
      setIsDark(darkMode);
      if (darkMode) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      updateTheme(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => updateTheme(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    } else {
      updateTheme(themeMode === 'dark');
    }
  }, [themeMode]);

  const lineThemeColor = selectedLine === '2호선' ? '#00A84D' : '#77C4A3';

  // 다음역 계산
  const getNextStation = () => {
    const stations = SUBWAY_STATIONS[selectedLine];
    const currentIndex = stations.indexOf(startStation);
    if (currentIndex === -1) return '';

    if (selectedLine === '2호선') {
      return direction === '내선' 
        ? stations[(currentIndex + 1) % stations.length] 
        : stations[(currentIndex - 1 + stations.length) % stations.length];
    } else {
      return direction === '상행' 
        ? (currentIndex > 0 ? stations[currentIndex - 1] : '종착역')
        : (currentIndex < stations.length - 1 ? stations[currentIndex + 1] : '종착역');
    }
  };

  // 1. 실시간 공공 API 호출 기능
  const fetchSubwayData = async () => {
    try {
      const res = await fetch(`/api/subway?line=${encodeURIComponent(selectedLine)}&direction=${encodeURIComponent(direction)}`);
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
    const interval = setInterval(fetchSubwayData, 12000); // 12초마다 실시간 갱신
    return () => clearInterval(interval);
  }, [selectedLine, direction]);

  // 2. 디바이스 센서 (모션 + GPS 속도) 기반 정차/출발 자동 감지
  useEffect(() => {
    if (!isBoarded) return;

    // A. Geolocation 속도 기반 감지
    let watchId: number;
    if ('geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const speed = pos.coords.speed; // m/s
          if (speed !== null) {
            const kmh = speed * 3.6;
            setUserSpeed(Math.round(kmh));
            if (kmh < 3) { // 3km/h 미만 정차 판단
              setIsStationary(true);
              setSensorStatus('센서: 터널 정차 감지됨 (0 km/h)');
            } else {
              setIsStationary(false);
              setSensorStatus(`센서: 주행 중 (${Math.round(kmh)} km/h)`);
            }
          }

          // B. GPS 위치 기반 출발역/도착역 자동 매칭
          const { latitude, longitude } = pos.coords;
          const startCoords = STATION_COORDINATES[startStation];
          const endCoords = STATION_COORDINATES[endStation];

          if (startCoords) {
            const distToStart = calculateDistance(latitude, longitude, startCoords.lat, startCoords.lng);
            if (distToStart < 0.3) {
              setGpsLocationMsg(`출발역 [${startStation}역] 인근 탑승 확인됨`);
            }
          }

          if (endCoords) {
            const distToEnd = calculateDistance(latitude, longitude, endCoords.lat, endCoords.lng);
            if (distToEnd < 0.3) {
              setGpsLocationMsg(`도착역 [${endStation}역] 접근 중 (자동 하차 준비)`);
            }
          }
        },
        (err) => console.warn('GPS Error:', err),
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
      );
    }

    // C. 가속도계 센서 기반 보조 감지
    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.acceleration;
      if (acc && acc.x !== null) {
        const totalAcc = Math.sqrt((acc.x || 0) ** 2 + (acc.y || 0) ** 2 + (acc.z || 0) ** 2);
        if (totalAcc < 0.2 && userSpeed === null) {
          setIsStationary(true);
          setSensorStatus('모션 센서: 정지 상태 감지');
        }
      }
    };

    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      window.addEventListener('devicemotion', handleMotion);
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      if (typeof window !== 'undefined') window.removeEventListener('devicemotion', handleMotion);
    };
  }, [isBoarded, startStation, endStation, userSpeed]);

  // 지연 타이머 로직
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

  const handleStartBoarding = () => {
    setIsBoarded(true);
    setIsDelayConfirmed(false);
    setDelaySeconds(0);
    setSensorStatus('센서 추적 개시');
    setGpsLocationMsg('실시간 GPS 위치 추적 중');
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

  const bgColor = isDark ? '#121212' : '#f2f4f6';
  const cardBg = isDark ? '#1e1e1e' : '#ffffff';
  const subCardBg = isDark ? '#2a2a2a' : '#f8f9fa';
  const textColor = isDark ? '#f9f9f9' : '#191f28';
  const subTextColor = isDark ? '#a0a0a0' : '#8b95a1';
  const borderColor = isDark ? '#333333' : '#e5e8eb';

  return (
    <main 
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 transition-colors duration-200"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <div 
        className="w-full max-w-md p-6 space-y-5 transition-colors duration-200 shadow-xl"
        style={{ 
          backgroundColor: cardBg, 
          borderRadius: '24px', 
          boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.08)' 
        }}
      >
        {/* Header & Theme Switcher */}
        <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor }}>
          <div className="flex items-center gap-2.5">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: lineThemeColor }}
            >
              <Train className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight" style={{ margin: 0, fontSize: '20px' }}>왜멈추니</h1>
              <p className="text-xs font-medium" style={{ margin: 0, fontSize: '12px', color: subTextColor }}>실시간 터널 정차 감지기</p>
            </div>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ backgroundColor: subCardBg }}>
            <button
              onClick={() => setThemeMode('light')}
              style={{
                padding: '6px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: themeMode === 'light' ? cardBg : 'transparent',
                color: themeMode === 'light' ? textColor : subTextColor
              }}
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setThemeMode('system')}
              style={{
                padding: '6px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: themeMode === 'system' ? cardBg : 'transparent',
                color: themeMode === 'system' ? textColor : subTextColor
              }}
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setThemeMode('dark')}
              style={{
                padding: '6px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: themeMode === 'dark' ? cardBg : 'transparent',
                color: themeMode === 'dark' ? textColor : subTextColor
              }}
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Line Tabs */}
        <div className="grid grid-cols-2 p-1.5 gap-1 rounded-2xl" style={{ backgroundColor: subCardBg }}>
          <button
            onClick={() => handleLineChange('2호선')}
            disabled={isBoarded}
            style={{
              padding: '10px 0',
              borderRadius: '12px',
              border: 'none',
              fontWeight: 'bold',
              fontSize: '13px',
              backgroundColor: selectedLine === '2호선' ? cardBg : 'transparent',
              color: selectedLine === '2호선' ? '#00A84D' : subTextColor
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
              backgroundColor: selectedLine === '경의중앙선' ? cardBg : 'transparent',
              color: selectedLine === '경의중앙선' ? '#77C4A3' : subTextColor
            }}
          >
            경의중앙선
          </button>
        </div>

        {/* Direction Tabs */}
        <div className="flex gap-2">
          {selectedLine === '2호선' ? (
            <>
              <button
                onClick={() => setDirection('내선')}
                disabled={isBoarded}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                style={{
                  border: `1.5px solid ${direction === '내선' ? '#00A84D' : borderColor}`,
                  backgroundColor: direction === '내선' ? (isDark ? 'rgba(0,168,77,0.15)' : '#e6f7ed') : cardBg,
                  color: direction === '내선' ? '#00A84D' : subTextColor
                }}
              >
                🔄 2호선 내선순환
              </button>
              <button
                onClick={() => setDirection('외선')}
                disabled={isBoarded}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                style={{
                  border: `1.5px solid ${direction === '외선' ? '#00A84D' : borderColor}`,
                  backgroundColor: direction === '외선' ? (isDark ? 'rgba(0,168,77,0.15)' : '#e6f7ed') : cardBg,
                  color: direction === '외선' ? '#00A84D' : subTextColor
                }}
              >
                🔃 2호선 외선순환
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setDirection('상행')}
                disabled={isBoarded}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                style={{
                  border: `1.5px solid ${direction === '상행' ? '#77C4A3' : borderColor}`,
                  backgroundColor: direction === '상행' ? (isDark ? 'rgba(119,196,163,0.15)' : '#edf8f3') : cardBg,
                  color: direction === '상행' ? '#77C4A3' : subTextColor
                }}
              >
                ⬆️ 경의중앙선 상행
              </button>
              <button
                onClick={() => setDirection('하행')}
                disabled={isBoarded}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                style={{
                  border: `1.5px solid ${direction === '하행' ? '#77C4A3' : borderColor}`,
                  backgroundColor: direction === '하행' ? (isDark ? 'rgba(119,196,163,0.15)' : '#edf8f3') : cardBg,
                  color: direction === '하행' ? '#77C4A3' : subTextColor
                }}
              >
                ⬇️ 경의중앙선 하행
              </button>
            </>
          )}
        </div>

        {/* Station Selection Box */}
        <div className="relative p-4 space-y-3 rounded-2xl border" style={{ backgroundColor: subCardBg, borderColor }}>
          <div className="space-y-3" style={{ paddingRight: '40px' }}>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold block" style={{ color: subTextColor }}>출발역</label>
                <span 
                  className="text-[11px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1"
                  style={{ backgroundColor: isDark ? 'rgba(0,168,77,0.2)' : '#e6f7ed', color: lineThemeColor }}
                >
                  다음역: {getNextStation()}역 <ArrowRight className="w-3 h-3 inline" />
                </span>
              </div>
              <select
                value={startStation}
                onChange={(e) => setStartStation(e.target.value)}
                disabled={isBoarded}
                className="w-full p-2.5 rounded-xl border font-bold text-sm outline-none"
                style={{ backgroundColor: cardBg, color: textColor, borderColor }}
              >
                {SUBWAY_STATIONS[selectedLine].map((st) => (
                  <option key={st} value={st}>{st}역</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold block mb-1" style={{ color: subTextColor }}>도착역</label>
              <select
                value={endStation}
                onChange={(e) => setEndStation(e.target.value)}
                disabled={isBoarded}
                className="w-full p-2.5 rounded-xl border font-bold text-sm outline-none"
                style={{ backgroundColor: cardBg, color: textColor, borderColor }}
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
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border flex items-center justify-center shadow-md cursor-pointer disabled:opacity-30"
            style={{ backgroundColor: cardBg, borderColor, color: lineThemeColor }}
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>

        {/* Boarding & Automatic Sensor Dashboard */}
        {!isBoarded ? (
          <button
            onClick={handleStartBoarding}
            className="w-full text-white font-bold py-4 rounded-2xl border-none text-base cursor-pointer shadow-lg flex items-center justify-center gap-2"
            style={{ backgroundColor: lineThemeColor }}
          >
            <Play className="w-5 h-5 fill-current" /> 자동 탑승 감지 시작 ({direction})
          </button>
        ) : (
          <div className="space-y-3">
            {/* GPS 및 자동 감지 상태 표시 */}
            <div 
              className="p-4 rounded-2xl border space-y-1.5 text-xs"
              style={{ 
                backgroundColor: isDark ? 'rgba(0,168,77,0.15)' : '#e6f7ed', 
                borderColor: isDark ? 'rgba(0,168,77,0.3)' : '#b3e6c8' 
              }}
            >
              <div className="flex items-center justify-between font-bold" style={{ color: lineThemeColor }}>
                <span className="flex items-center gap-1"><Cpu className="w-4 h-4" /> {sensorStatus}</span>
                <span className="flex items-center gap-1"><Navigation className="w-3.5 h-3.5" /> GPS 연결됨</span>
              </div>
              <p className="font-medium" style={{ color: textColor }}>{gpsLocationMsg}</p>
              <p className="font-extrabold text-sm pt-1 border-t" style={{ borderColor: 'rgba(0,0,0,0.05)', color: textColor }}>
                [{selectedLine}] {startStation} ➔ {endStation}
              </p>
            </div>

            {/* 정차 시뮬레이터 및 자동 타이머 */}
            <div 
              className="p-4 space-y-2 rounded-2xl border"
              style={{ 
                backgroundColor: isDark ? 'rgba(245,158,11,0.15)' : '#fff8e6', 
                borderColor: isDark ? 'rgba(245,158,11,0.3)' : '#ffe8b3' 
              }}
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-4 h-4" /> 수동 테스트 정차 토글
                </span>
                <input 
                  type="checkbox" 
                  checked={isStationary} 
                  onChange={(e) => setIsStationary(e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                />
              </div>
              {isStationary && (
                <div className="text-center pt-2 border-t border-amber-200 dark:border-amber-900/50">
                  <p className="text-xs text-amber-800 dark:text-amber-300">정차 감지 지속: <span className="font-mono font-bold">{formatTime(delaySeconds)}</span></p>
                  {isDelayConfirmed && (
                    <p className="text-xs font-extrabold text-rose-600 mt-1">🚨 3분 초과 비정상 지연 확정!</p>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleEndBoarding}
              className="w-full text-white font-bold py-4 rounded-2xl border-none text-base cursor-pointer flex items-center justify-center gap-2"
              style={{ backgroundColor: isDark ? '#333333' : '#191f28' }}
            >
              <Square className="w-5 h-5 fill-current" /> 하차 완료 (증명서 발급)
            </button>
          </div>
        )}

        {/* Realtime API Monitor */}
        <div className="pt-3 border-t" style={{ borderColor }}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold" style={{ color: subTextColor }}>실시간 공공 API ({selectedLine} · {direction})</span>
            <button onClick={fetchSubwayData} className="border-none bg-transparent cursor-pointer" style={{ color: subTextColor }}>
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
            {apiData.length > 0 ? (
              apiData.map((train, idx) => (
                <div 
                  key={idx} 
                  className="px-3 py-2 text-xs flex justify-between items-center rounded-xl border"
                  style={{ backgroundColor: subCardBg, borderColor }}
                >
                  <span className="font-bold" style={{ color: textColor }}>{train.trainNo}호 열차</span>
                  <span style={{ color: subTextColor }}>
                    {train.statnNm}역 ({train.statnTcv === '1' ? '도착/정차' : train.statnTcv === '2' ? '출발' : '진행중'})
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-3 text-xs" style={{ color: subTextColor }}>
                실시간 열차 위치 정보를 조회 중입니다...
              </div>
            )}
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
