// src/pages/accommodation/AccommodationDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AccommodationAPI } from "../api/AccommodationAPI"; // 경로는 프로젝트에 맞게 조정

// --- 보조 컴포넌트(간단 버전) ---
const Badge = ({ children }) => (
  <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium">
    {children}
  </span>
);

const ImageGrid = ({ images = [] }) => {
  if (!images.length) return null;
  const [main, ...rest] = images;
  return (
    <div className="grid grid-cols-4 gap-2 overflow-hidden rounded-2xl">
      <img src={main} alt="main" className="col-span-2 row-span-2 h-64 w-full object-cover" />
      {rest.slice(0, 4).map((src, i) => (
        <img key={i} src={src} alt={`img-${i}`} className="h-32 w-full object-cover" />
      ))}
    </div>
  );
};

const RoomCard = ({ room }) => (
  <div className="rounded-2xl border p-4">
    <div className="flex items-start gap-4">
      <img
        src={room.images?.[0] || "https://placehold.co/320x200"}
        alt={room.name}
        className="h-28 w-40 rounded-xl object-cover"
      />
      <div className="flex-1">
        <div className="text-lg font-semibold">{room.name}</div>
        <div className="mt-1 text-sm text-gray-600">
          입실 {room.checkin} · 퇴실 {room.checkout}
        </div>
        <div className="mt-1 text-sm text-gray-600">
          기준{room.base}인 · 최대{room.max}인
        </div>
      </div>
      <div className="text-right">
        <div className="text-lg font-bold">
          {room.price.toLocaleString("ko-KR")}원
        </div>
        <button className="mt-2 rounded-xl bg-black px-4 py-2 text-white">
          객실 예약
        </button>
      </div>
    </div>
  </div>
);

const StickyTabs = ({ tabs }) => {
  const [active, setActive] = useState(tabs[0].id);

  useEffect(() => {
    const onScroll = () => {
      let current = active;
      for (const t of tabs) {
        const el = document.getElementById(t.id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= 100) current = t.id;
      }
      setActive(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [tabs]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <div className="sticky top-0 z-10 -mx-4 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex gap-4 overflow-x-auto py-3">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => scrollTo(t.id)}
              className={`whitespace-nowrap rounded-full px-3 py-1 text-sm ${
                active === t.id ? "bg-black text-white" : "bg-gray-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- 본 컴포넌트 (BoardDetail 스타일) ---
export default function AccommodationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);     // 상세 데이터
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  // 상세 조회 (try/catch + 로딩/에러 처리)
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setErrMsg("");
        const res = await AccommodationAPI.get(id);
        setData(res);
      } catch (err) {
        console.error("숙소 조회 오류:", err);
        setErrMsg("숙소 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  // 삭제
  const handleDelete = async () => {
    if (!window.confirm("삭제하시겠습니까?")) return;
    try {
      await AccommodationAPI.remove(id);
      alert("숙소가 삭제되었습니다.");
      navigate("/accommodations");
    } catch (err) {
      console.error("숙소 삭제 오류:", err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  if (loading) return <div className="p-8">불러오는 중…</div>;
  if (errMsg) return <div className="p-8 text-red-600">{errMsg}</div>;
  if (!data) return null;

  const tabs = useMemo(
    () => [
      { id: "overview", label: "개요" },
      { id: "rooms", label: "객실" },
      { id: "fac", label: "서비스 및 부대시설" },
      { id: "loc", label: "위치" },
      { id: "reviews", label: "리뷰" },
    ],
    []
  );

  return (
    <div>
      {/* 헤더 영역 (제목/가격) */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">
            {data.type} · {data.stars}성급
          </div>
          <h1 className="mt-1 text-2xl font-bold">{data.name}</h1>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold">
            {data.pricePerNight.toLocaleString("ko-KR")}원
          </div>
          <div className="text-xs text-gray-500">1박 기준</div>
        </div>
      </div>

      {/* 액션 버튼 (수정/삭제/목록) */}
      <div className="mb-4 flex gap-2">
        <Link
          to="edit"
          className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
        >
          수정
        </Link>
        <button
          onClick={handleDelete}
          className="rounded border px-3 py-1 text-sm text-red-600 hover:bg-red-50"
        >
          삭제
        </button>
        <Link
          to="/accommodations"
          className="ml-auto rounded border px-3 py-1 text-sm hover:bg-gray-50"
        >
          목록으로
        </Link>
      </div>

      {/* 이미지 그리드 */}
      <div className="mt-4">
        <ImageGrid images={data.images} />
      </div>

      {/* 메타 정보 */}
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-700">
        <Badge>★ {data.rating}</Badge>
        <span>리뷰 {data.reviewCount?.toLocaleString()}개</span>
        <span>·</span>
        <span>
          {data.city} · {data.address}
        </span>
      </div>

      {/* 탭 (sticky) */}
      <StickyTabs tabs={tabs} />

      {/* 섹션: 개요 */}
      <section id="overview" className="scroll-mt-24 py-6">
        <h2 className="mb-3 text-xl font-semibold">개요</h2>
        <p className="text-gray-700">{data.summary}</p>
      </section>

      {/* 섹션: 객실 */}
      <section id="rooms" className="scroll-mt-24 space-y-4 py-6">
        <h2 className="mb-3 text-xl font-semibold">객실 선택</h2>
        {data.rooms?.map((r) => (
          <RoomCard key={r.id} room={r} />
        ))}
      </section>

      {/* 섹션: 부대시설 */}
      <section id="fac" className="scroll-mt-24 py-6">
        <h2 className="mb-3 text-xl font-semibold">서비스 및 부대시설</h2>
        <div className="flex flex-wrap gap-2">
          {data.facilities?.common?.map((x, i) => (
            <Badge key={i}>{x}</Badge>
          ))}
        </div>
      </section>

      {/* 섹션: 위치 */}
      <section id="loc" className="scroll-mt-24 py-6">
        <h2 className="mb-3 text-xl font-semibold">위치</h2>
        <div className="rounded-2xl border p-4 text-sm text-gray-700">
          <div>주소: {data.address}</div>
          <div>설명: {data.location?.poi}</div>
        </div>
      </section>

      {/* 섹션: 리뷰 */}
      <section id="reviews" className="scroll-mt-24 py-6">
        <h2 className="mb-3 text-xl font-semibold">리뷰</h2>
        <div className="rounded-2xl border p-4 text-gray-700">리뷰 영역</div>
      </section>
    </div>
  );
}
