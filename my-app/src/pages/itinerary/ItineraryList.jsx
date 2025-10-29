import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllItineraries, deleteItinerary } from "../../api/itineraryAPI";

/**
 * 여행 일정 목록
 */
const ItineraryList = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setErrMsg("");
      const data = await getAllItineraries();
      setItems(Array.isArray(data) ? data : data?.content || []);
    } catch (e) {
      console.error(e);
      setErrMsg("여행 일정 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteItinerary(id);
      await load();
    } catch (e) {
      console.error(e);
      alert("삭제에 실패했습니다.");
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div>로딩 중...</div>;

  return (
    <div style={{ padding: 16 }}>
      <h1>여행 일정 목록</h1>
      {errMsg && <div style={{ color: "red", margin: "8px 0" }}>{errMsg}</div>}

      <div style={{ margin: "12px 0" }}>
        <button onClick={() => navigate("/itineraries/create")}>+ 새 일정</button>
      </div>

      {items.length === 0 ? (
        <div>데이터가 없습니다.</div>
      ) : (
        <table border="1" cellPadding="8" cellSpacing="0" width="100%">
          <thead>
            <tr>
              <th>ID</th>
              <th>제목</th>
              <th>기간</th>
              <th>생성방식</th>
              <th>소유자</th>
              <th>생성일</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.itineraryId}>
                <td>{it.itineraryId}</td>
                <td>{it.title}</td>
                <td>{it.startDate} ~ {it.endDate}</td>
                <td>{it.generatedFrom}</td>
                <td>{it.user?.username || it.user?.email || it.user?.userId || "-"}</td>
                <td>{it.createdAt}</td>
                <td>
                  <button onClick={() => navigate(`/itineraries/${it.itineraryId}`)}>상세</button>{" "}
                  <button onClick={() => navigate(`/itineraries/${it.itineraryId}/edit`)}>수정</button>{" "}
                  <button onClick={() => onDelete(it.itineraryId)}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ItineraryList;
