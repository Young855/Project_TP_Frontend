// src/pages/favorite/FavoritePage.jsx
import { Routes, Route, useNavigate, Navigate, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import FavoriteList from "./FavoriteList";

const STORAGE_KEY = "tp_search_criteria";

export default function FavoritePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const userId = Number(localStorage.getItem("userId"));

  // URL 기준으로 초기값 잡기
  const urlCriteria = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      checkIn: params.get("checkIn") || "",
      checkOut: params.get("checkOut") || "",
      guests: Number(params.get("guests")) || 2,
    };
  }, [location.search]);

  const [form, setForm] = useState(urlCriteria);

  useEffect(() => {
    setForm(urlCriteria);
  }, [urlCriteria]);

  const handleGoToSearch = () => {
    navigate(`/?userId=${userId}`);
  };

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    if (!form.checkIn || !form.checkOut) {
      alert("체크인/체크아웃 날짜를 선택해주세요.");
      return;
    }

    // ✅ Header pill도 같이 쓰도록 tp_search_criteria에 저장 (destination은 비워둠)
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          destination: "",
          checkIn: form.checkIn,
          checkOut: form.checkOut,
          guests: Number(form.guests) || 2,
        })
      );
    } catch {}

    const params = new URLSearchParams();
    params.set("checkIn", form.checkIn);
    params.set("checkOut", form.checkOut);
    params.set("guests", String(form.guests));

    // ✅ favorites 내에서 URL만 바꿔서 리스트/가격 다시 계산되게
    navigate(`/favorites?${params.toString()}`, { replace: true });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:px-6 md:py-10">
      {/* 상단 헤더 영역 */}
      <div className="flex justify-between items-center mb-6 md:mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">찜 목록</h1>
          <p className="mt-1 text-sm text-gray-500" />
        </div>

        <button
          type="button"
          onClick={handleGoToSearch}
          className="px-4 py-2 md:px-6 md:py-2.5 rounded-lg 
                     border border-blue-500 
                     text-blue-600 
                     text-sm md:text-base font-bold
                     bg-white hover:bg-blue-50 
                     transition-colors"
        >
          숙소 찾으러 가기
        </button>
      </div>


      {/* 찜 목록 카드 리스트 */}
      <Routes>
        <Route index element={<FavoriteList userId={userId} />} />
        <Route path="*" element={<Navigate to="/favorites" replace />} />
      </Routes>
    </div>
  );
}
