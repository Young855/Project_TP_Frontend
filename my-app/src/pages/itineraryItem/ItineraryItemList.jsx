import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllItineraryItems, deleteItineraryItem } from "../../api/itineraryItemAPI";

/**
 * 일정 항목 목록
 */
const ItineraryItemList = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setErrMsg("");
      const data = await getAllItineraryItems();
      setItems(Array.isArray(data) ? data : data?.content || []);
    } catch (e) {
      console.error(e);
      setErrMsg("일정 항목 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteItineraryItem(id);
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
      <h1>일정 항목 목록</h1>
      {errMsg && <div style={{ color: "red", margin: "8px 0" }}>{errMsg}</div>}

      <div style={{ margin: "12px 0" }}>
        <button onClick={() => navigate("/itinerary-items/create")}>+ 새 일정 항목</button>
      </div>

      {items.length === 0 ? (
        <div>데이터가 없습니다.</div>
      ) : (
        <table border="1" cellPadding="8" cellSpacing="0" width="100%">
          <thead>
            <tr>
              <th>ID</th>
              <th>Itinerary</th>
              <th>Type</th>
              <th>Title</th>
              <th>Time</th>
              <th>Sort</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.itemId}>
                <td>{it.itemId}</td>
                <td>{it.itinerary?.itineraryId || it.itineraryId || "-"}</td>
                <td>{it.itemType}</td>
                <td>{it.title}</td>
                <td>
                  {it.startTime || "-"}{it.endTime ? ` ~ ${it.endTime}` : ""}
                </td>
                <td>{it.sortOrder ?? "-"}</td>
                <td>
                  <button onClick={() => navigate(`/itinerary-items/${it.itemId}`)}>상세</button>{" "}
                  <button onClick={() => navigate(`/itinerary-items/${it.itemId}/edit`)}>수정</button>{" "}
                  <button onClick={() => onDelete(it.itemId)}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ItineraryItemList;
