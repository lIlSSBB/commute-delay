'use client';

import React from 'react';
import { X, CheckCircle, Download } from 'lucide-react';

interface DelayModalProps {
  isOpen: boolean;
  onClose: () => void;
  line: string;
  startStation: string;
  endStation: string;
  delayMinutes: number;
}

export default function DelayModal({ isOpen, onClose, line, startStation, endStation, delayMinutes }: DelayModalProps) {
  if (!isOpen) return null;

  const issueDate = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const themeColor = line === '2호선' ? '#00A84D' : '#77C4A3';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-sm p-6 space-y-5 rounded-3xl shadow-2xl relative transition-colors duration-200"
        style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)' }}
      >
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full bg-gray-100 dark:bg-neutral-800 border-none cursor-pointer opacity-60 hover:opacity-100"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-2 pt-2">
          <div 
            className="w-12 h-12 mx-auto rounded-full flex items-center justify-center text-white"
            style={{ backgroundColor: themeColor }}
          >
            <CheckCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-extrabold tracking-tight">지연증명서 자동 발급</h2>
          <p className="text-xs opacity-60">왜멈추니 실시간 센서 감지 완료</p>
        </div>

        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="opacity-60 text-xs">대상 노선</span>
            <span className="font-bold" style={{ color: themeColor }}>{line}</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-60 text-xs">이동 구간</span>
            <span className="font-bold">{startStation} ➔ {endStation}</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-60 text-xs">터널 정차 시간</span>
            <span className="font-bold text-rose-500">{delayMinutes}분 이상 지연</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-neutral-800">
            <span className="opacity-60 text-xs">발급 일자</span>
            <span className="font-medium text-xs">{issueDate}</span>
          </div>
        </div>

        <button
          onClick={() => alert('증명서 이미지가 저장되었습니다!')}
          className="w-full py-4 rounded-2xl text-white font-bold border-none text-sm cursor-pointer shadow-md flex items-center justify-center gap-2"
          style={{ backgroundColor: themeColor }}
        >
          <Download className="w-4 h-4" /> 지연증명서 저장하기
        </button>
      </div>
    </div>
  );
}
