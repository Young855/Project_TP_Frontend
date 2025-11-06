// src/pages/accommodation/AccommodationCreate.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AccommodationAPI } from "../api/AccommodationAPI"; // 경로는 프로젝트에 맞게 조정

const AccommodationCreate = () => {
  const navigate = useNavigate();

  // 폼 상태
  const [form, setForm] = useState({
    name: "",
    type: "HOTEL",       // HOTEL | MOTEL | PENSION | POOLVILLA ...
    stars: 5,            // 1~5
    city: "",
    address: "",
    pricePerNight: 0,
    tagsText: "",        // "뷰맛집,가족여행" 처럼 입력 → submit 시 배열로 변환
  });

  // 공용 입력 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    // 숫자 필드는 숫자로 변환
    if (name === "stars" || name === "pricePerNight") {
      setForm((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // 제출
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 간단 검증
    if (!form.name || !form.city || !form.address) {
      alert("이름/도시/주소는 필수입니다.");
      return;
    }
    if (form.pricePerNight < 0) {
      alert("1박 가격은 0 이상이어야 합니다.");
      return;
    }

    try {
      const payload = {
        name: form.name,
        type: form.type,
        stars: form.stars,
        city: form.city,
        address: form.address,
        pricePerNight: form.pricePerNight,
        // 콤마 구분 태그를 배열로 변환 (공백 제거)
        tags: form.tagsText
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      await AccommodationAPI.create(payload);
      alert("숙소가 성공적으로 등록되었습니다.");
      navigate("/accommodations"); // 리스트로 이동 (BoardCreate 흐름과 동일)
      // 상세로 이동하려면 위 줄을: navigate(`/accommodations/${id}`) 로 변경
    } catch (err) {
      console.error(err);
      alert("숙소 등록에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">숙소 등록</h2>

      <form onSubmit={handleSubmit}>
        {/* 이름 */}
        <input
          name="name"
          placeholder="이름"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full rounded border p-2 mb-2"
        />

        {/* 유형 / 성급 */}
        <div className="grid grid-cols-2 gap-2 mb-2">
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

          <select
            name="stars"
            value={form.stars}
            onChange={handleChange}
            className="w-full rounded border p-2"
          >
            {[5, 4, 3, 2, 1].map((s) => (
              <option key={s} value={s}>
                {s}성급
              </option>
            ))}
          </select>
        </div>

        {/* 도시 */}
        <input
          name="city"
          placeholder="도시 (예: 경주시)"
          value={form.city}
          onChange={handleChange}
          required
          className="w-full rounded border p-2 mb-2"
        />

        {/* 주소 */}
        <input
          name="address"
          placeholder="주소"
          value={form.address}
          onChange={handleChange}
          required
          className="w-full rounded border p-2 mb-2"
        />

        {/* 1박 가격 */}
        <input
          type="number"
          name="pricePerNight"
          min={0}
          step={1000}
          placeholder="1박 가격"
          value={form.pricePerNight}
          onChange={handleChange}
          required
          className="w-full rounded border p-2 mb-2"
        />

        {/* 태그 (콤마로 구분) */}
        <input
          name="tagsText"
          placeholder="태그 (쉼표로 구분: 뷰맛집,가족여행)"
          value={form.tagsText}
          onChange={handleChange}
          className="w-full rounded border p-2 mb-3"
        />

        <button type="submit" className="rounded bg-black px-4 py-2 text-white">
          작성
        </button>
      </form>
    </div>
  );
};

export default AccommodationCreate;
