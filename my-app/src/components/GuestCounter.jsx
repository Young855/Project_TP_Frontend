import React from 'react';
import { Plus, Minus } from 'lucide-react';

/**
 * 인원 수 카운터 컴포넌트
 * @param {object} props
 * @param {number} props.count - 현재 인원
 * @param {function} props.setCount - 인원 변경 함수
 * @param {string} props.label - 라벨 (예: 성인)
 */
const GuestCounter = ({ count, setCount, label }) => (
  <div className="flex items-right justify-between">
    <span className="text-gray-700">{label}</span>
    <div className="flex items-right space-x-2">
      <button
        type="button"
        onClick={() => setCount(Math.max(0, count - 1))}
        className="w-8 h-8 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 flex items-center justify-center transition-colors disabled:opacity-50"
        disabled={count === 0}
      >
        <Minus size={16} />
        <span className="text-xl font-medium pb-0.5">-</span>
      </button>
      <span className="text-lg font-medium w-6 text-center">{count}</span>
      <button
        type="button"
        onClick={() => setCount(count + 1)}
        className="w-8 h-8 rounded-full border border-blue-600 text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-colors"
      >
        <Plus size={16} />
        <span className="text-xl font-medium pb-0.5">+</span>
      </button>
    </div>
  </div>
);

export default GuestCounter;