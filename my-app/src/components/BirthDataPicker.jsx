import React from 'react';

/**
 * 생년월일 드롭다운 컴포넌트
 * @param {object} props
 * @param {string} props.year - 선택된 연도
 * @param {function} props.setYear - 연도 변경 함수
 * @param {string} props.month - 선택된 월
 * @param {function} props.setMonth - 월 변경 함수
 * @param {string} props.day - 선택된 일
 * @param {function} props.setDay - 일 변경 함수
 */
const BirthDatePicker = ({ year, setYear, month, setMonth, day, setDay }) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="flex space-x-2">
      <select
        value={year}
        onChange={(e) => setYear(e.target.value)}
        className="form-input w-1/3"
        aria-label="Year of birth"
      >
        <option value="">년도</option>
        {years.map((y) => (
          <option key={y} value={y}>{y}년</option>
        ))}
      </select>
      <select
        value={month}
        onChange={(e) => setMonth(e.target.value)}
        className="form-input w-1/3"
        aria-label="Month of birth"
      >
        <option value="">월</option>
        {months.map((m) => (
          <option key={m} value={m}>{m}월</option>
        ))}
      </select>
      <select
        value={day}
        onChange={(e) => setDay(e.target.value)}
        className="form-input w-1/3"
        aria-label="Day of birth"
      >
        <option value="">일</option>
        {days.map((d) => (
          <option key={d} value={d}>{d}일</option>
        ))}
      </select>
    </div>
  );
};

export default BirthDatePicker;