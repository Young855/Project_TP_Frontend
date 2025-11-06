// src/pages/accommodation/AccommodationList.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";   
import { AccommodationAPI } from "@/api/AccommodationAPI"; // 경로는 프로젝트에 맞게 조정

export default function AccommodationList() {
  // 숙소 리스트 상태 (배열로 초기화: BoardList와 동일)
  const [accommodations, setAccommodations] = useState([]);

  // (선택) 페이지 정보가 필요하면 확장 가능
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    size: 12,
    totalPages: 1,
    totalElements: 0,
  });

  // 컴포넌트 마운트 시 전체 숙소 조회
  useEffect(() => {
    const fetchAccommodations = async () => {
      // BoardList처럼 단순 리스트 조회 패턴
      // 필요 시 search로 변경 가능: AccommodationAPI.search({ page, size, ...filters })
      const data = await AccommodationAPI.list({
        page: pageInfo.page,
        size: pageInfo.size,
        sort: "id,desc",
      });
      // 백엔드가 PageResponseDTO를 반환한다고 가정
      setAccommodations(data.content || []);
      setPageInfo((prev) => ({
        ...prev,
        totalPages: data.totalPages ?? 1,
        totalElements: data.totalElements ?? (data.content?.length || 0),
      }));
    };

    fetchAccommodations();
    // page/size가 변할 때만 재조회(단순 패턴 유지)
  }, [pageInfo.page, pageInfo.size]);

  return (
    <div>
      <h1>숙소 리스트</h1>

      {/* 숙소 등록 페이지 링크: /accommodations/new */}
      <Link to="new">숙소 등록</Link>

      <ul>
        {/* 숙소가 없을 때 */}
        {accommodations.length === 0 ? (
          <li>숙소가 없습니다.</li>
        ) : (
          // 숙소가 있을 때
          accommodations.map((acc) => (
            <li key={acc.id}>
              {/* /accommodations/:id */}
              <Link to={`${acc.id}`}>{acc.name}</Link>
              {" "}— {acc.stars}성급 · {acc.type} · {acc.city} {acc.address && `· ${acc.address}`}
              {" "}— 1박 {Number(acc.pricePerNight || 0).toLocaleString("ko-KR")}원
            </li>
          ))
        )}
      </ul>

      {/* (선택) BoardList엔 없지만, 필요하면 간단한 페이지네이션 추가 가능 */}
      {pageInfo.totalPages > 1 && (
        <div style={{ marginTop: "12px" }}>
          {Array.from({ length: pageInfo.totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPageInfo((p) => ({ ...p, page: i }))}
              style={{
                marginRight: "6px",
                padding: "4px 8px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                background: i === pageInfo.page ? "#000" : "#fff",
                color: i === pageInfo.page ? "#fff" : "#000",
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
