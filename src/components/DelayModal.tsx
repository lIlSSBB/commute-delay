// src/components/DelayModal.tsx
'use client';

import React from 'react';
import { CheckCircle2, Download, X } from 'lucide-react';

interface DelayModalProps {
  isOpen: boolean;
  onClose: () => void;
  line: string;
  startStation: string;
  endStation: string;
  delayMinutes: number;
}

export default function DelayModal({
  isOpen,
  onClose,
  line,
  startStation,
  endStation,
  delayMinutes,
}: DelayModalProps) {
  if (!isOpen) return null;

  const certificateId = `WHY-STOP-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
          <div>
            <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Official Verification</span>
            <h3 className="text-lg font-bold">왜멈추니 간이 지연증명서</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Body */}
        <div className="p-6 space-y-5 text-gray-800">
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs text-emerald-800 font-medium">실시간 센서 및 공공 API 인증 완료</p>
              <p className="text-sm font-bold text-emerald-900">{line} 터널 내 {delayMinutes}분 정차 확인됨</p>
            </div>
          </div>

          <div className="space-y-3 text-sm divide-y divide-gray-100">
            <div className="flex justify-between pt-2">
              <span className="text-gray-500">문서 번호</span>
              <span className="font-mono font-medium text-gray-700">{certificateId}</span>
            </div>
            <div className="flex justify-between pt-3">
              <span className="text-gray-500">발급 일시</span>
              <span className="font-medium text-gray-700">{today}</span>
            </div>
            <div className="flex justify-between pt-3">
              <span className="text-gray-500">이용 노선</span>
              <span className="font-bold text-slate-900">{line}</span>
            </div>
            <div className="flex justify-between pt-3">
              <span className="text-gray-500">탑승 구간</span>
              <span className="font-semibold text-slate-900">{startStation} ➔ {endStation}</span>
            </div>
            <div className="flex justify-between pt-3">
              <span className="text-gray-500">측정 지연 시간</span>
              <span className="font-bold text-rose-600">+{delayMinutes}분 초과 정차</span>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-500 text-center">
            본 증명서는 [왜멈추니] 스마트폰 센서 데이터와 실시간 운행 기록을 기반으로 자동 생성된 간이 입증서입니다.
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 bg-gray-50 border-t border-gray-100 flex gap-3">
          <button
            onClick={() => alert('증명서 이미지가 저장되었습니다.')}
            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            이미지로 저장
          </button>
        </div>

      </div>
    </div>
  );
}
