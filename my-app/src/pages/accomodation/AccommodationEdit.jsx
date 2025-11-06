// src/pages/accommodation/AccommodationEdit.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
// 경로는 프로젝트 구조에 맞게 조정하세요.
import { AccommodationAPI } from "@/api/AccommodationAPI";

export default function AccommodationEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  // BoardEdit처럼 초기값을 가진 상태로 시작 (controlled input 안정성)
  const [form, setForm] = useState({
    name: "",
    type: "HOTEL",     // HOTEL | MOTEL | PENSION | POOLVILLA ...
    stars: 5,          // 1~5
    city: "",
    address: "",
    pricePerNight: 0,
  });

  // 단일 숙소 조회
  useEffect(() => {
    const fetchAccommodation = async () => {
      try {
        const data = await AccommodationAPI.get(id);
        // 방어적 매핑: 누락 필드가 있어도 폼이 깨지지 않게 기본값 유지
        setForm({
          name: data.name ?? "",
          type: data.type ?? "HOTEL",
          stars: Number(data.stars ?? 5),
          city: data.city ?? "",
          address: data.address ?? "",
          pricePerNight: Number(data.pricePerNight ?? 0),
        });
      } catch (err) {
        console.error("숙소 조회 오류:", err);
        alert("숙소 정보를 불러오는 중 오류가 발생했습니다.");
      }
    };
    fetchAccommodation();
  }, [id]);

  // 공용 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    // 숫자 필드는 숫자로 변환
    if (name === "stars" || name === "pricePerNight") {
      setForm((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // 수정 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await AccommodationAPI.update(id, form);
      alert("숙소가 수정되었습니다.");
      navigate(`/accommodations/${id}`); // 수정 후 상세 페이지로 이동
    } catch (err) {
      console.error("숙소 수정 오류:", err);
      alert("숙소 수정 중 오류가 발생했습니다.");
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">숙소 수정</h1>

      <form onSubmit={handleSubmit}>
        {/* 이름 */}
        <div className="mb-2">
          <label className="block text-sm mb-1">이름</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full rounded border p-2"
            placeholder="예) 라한셀렉트 경주"
          />
        </div>

        {/* 유형 / 성급 */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <label className="block text-sm mb-1">유형</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full rounded border p-2"
            >
              <option value="HOTEL">호텔·리조트</option>
              <option value="MOTEL">모텔</option>
              <option value="PENSION">펜션</option>
              <option value="POOLVILLA">풀빌라</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">성급</label>
            <select
              name="stars"
              value={form.stars}
              onChange={handleChange}
              className="w-full rounded border p-2"
            >
              {[5, 4, 3, 2, 1].map((s) => (
                <option key={s} value={s}>{s}성급</option>
              ))}
            </select>
          </div>
        </div>

        {/* 도시 */}
        <div className="mb-2">
          <label className="block text-sm mb-1">도시</label>
          <input
            name="city"
            value={form.city}
            onChange={handleChange}
            required
            className="w-full rounded border p-2"
            placeholder="예) 경주시"
          />
        </div>

        {/* 주소 */}
        <div className="mb-2">
          <label className="block text-sm mb-1">주소</label>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            required
            className="w-full rounded border p-2"
            placeholder="상세 주소"
          />
        </div>

        {/* 1박 가격 */}
        <div className="mb-3">
          <label className="block text-sm mb-1">1박 가격</label>
          <input
            type="number"
            name="pricePerNight"
            value={form.pricePerNight}
            onChange={handleChange}
            required
            min={0}
            step={1000}
            className="w-full rounded border p-2"
            placeholder="예) 220000"
          />
        </div>

        <button type="submit" className="rounded bg-black px-4 py-2 text-white">
          수정
        </button>
      </form>
    </div>
  );
}
