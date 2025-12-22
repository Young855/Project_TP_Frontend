import { useRef, useState, useEffect } from "react";

const LEFT_HANDLE_MAX = 400000;
const RIGHT_HANDLE_MIN = 30000;

export default function PriceRangeSlider({ min, max, step, minValue, maxValue, onChange }) {
  const trackRef = useRef(null);
  const [dragging, setDragging] = useState(null);

  const toPercent = (value) => ((value - min) / (max - min)) * 100;

  useEffect(() => {
    if (!dragging) return;

    const handleMove = (e) => {
      const clientX = e.clientX;
      const rect = trackRef.current?.getBoundingClientRect();
      if (!rect) return;

      let ratio = (clientX - rect.left) / rect.width;
      ratio = Math.max(0, Math.min(1, ratio));

      let value = min + (max - min) * ratio;
      value = Math.round(value / step) * step;

      if (dragging === "min") {
        value = Math.max(min, value);
        value = Math.min(value, maxValue);
        value = Math.min(value, LEFT_HANDLE_MAX);
        onChange(value, maxValue);
      } else if (dragging === "max") {
        value = Math.min(value, max);
        value = Math.max(value, minValue);
        value = Math.max(value, RIGHT_HANDLE_MIN);
        onChange(minValue, value);
      }
    };

    const stopDrag = () => setDragging(null);

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", stopDrag);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", stopDrag);
    };
  }, [dragging, min, max, step, minValue, maxValue, onChange]);

  const minPercent = toPercent(minValue);
  const maxPercent = toPercent(maxValue);

  return (
    <div className="mt-2">
      <div ref={trackRef} className="relative h-10 w-4/5">
        <div className="absolute top-1/2 left-0 w-full h-[3px] -translate-y-1/2 rounded-full bg-gray-200" />
        <div
          className="absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-blue-500"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
        />
        {/* 왼쪽 핸들 */}
        <button
          type="button"
          className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center"
          style={{
            left: `calc(${minPercent}% - 0.625rem)`,
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            backgroundColor: "#ffffff",
            border: "1px solid #cbd5e1",
            boxShadow: "0 0 4px rgba(0,0,0,0.15)",
          }}
          onMouseDown={() => setDragging("min")}
          onTouchStart={(e) => { e.preventDefault(); setDragging("min"); }}
        />
        {/* 오른쪽 핸들 */}
        <button
          type="button"
          className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center"
          style={{
            left: `calc(${maxPercent}% - 0.625rem)`,
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            backgroundColor: "#ffffff",
            border: "1px solid #cbd5e1",
            boxShadow: "0 0 4px rgba(0,0,0,0.15)",
          }}
          onMouseDown={() => setDragging("max")}
          onTouchStart={(e) => { e.preventDefault(); setDragging("max"); }}
        />
      </div>
    </div>
  );
}