import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllRooms, getRoomsByPropertyId, deleteRoom } from "../../api/roomAPI";

/**
 * 객실 목록
 * - 전체 목록 조회
 * - propertyId로 필터 조회 지원
 * - 상세/수정/삭제 이동
 */
const RoomList = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");
  const [propertyFilter, setPropertyFilter] = useState("");

  const load = async (propertyId) => {
    try {
      setLoading(true);
      setErrMsg("");
      const data = propertyId
        ? await getRoomsByPropertyId(propertyId)
        : await getAllRooms();
      setItems(Array.isArray(data) ? data : data?.content || []);
    } catch (e) {
      console.error(e);
      setErrMsg("객실 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteRoom(id);
      await load(propertyFilter || undefined);
    } catch (e) {
      console.error(e);
      alert("삭제에 실패했습니다.");
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div>로딩 중...</div>;

  return (
    <div style={{ padding: 16 }}>
      <h1>객실 목록</h1>
      {errMsg && <div style={{ color: "red", margin: "8px 0" }}>{errMsg}</div>}

      <div style={{ display: "flex", gap: 8, alignItems: "center", margin: "8px 0 16px" }}>
        <input
          type="number"
          placeholder="Property ID로 필터"
          value={propertyFilter}
          onChange={(e) => setPropertyFilter(e.target.value)}
          style={{ width: 180 }}
        />
        <button onClick={() => load(propertyFilter || undefined)}>검색</button>
        <button onClick={() => { setPropertyFilter(""); load(); }}>초기화</button>
        <div style={{ flex: 1 }} />
        <button onClick={() => navigate("/rooms/create")}>+ 새 객실</button>
      </div>

      {items.length === 0 ? (
        <div>데이터가 없습니다.</div>
      ) : (
        <table border="1" cellPadding="8" cellSpacing="0" width="100%">
          <thead>
            <tr>
              <th>ID</th>
              <th>Property</th>
              <th>Name</th>
              <th>Capacity</th>
              <th>Stock</th>
              <th>Price/Night</th>
              <th>Refundable</th>
              <th>Created</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.roomId}>
                <td>{r.roomId}</td>
                <td>{r.property?.propertyId ?? r.propertyId ?? "-"}</td>
                <td>{r.name}</td>
                <td>{r.capacity}</td>
                <td>{r.stock}</td>
                <td>{r.pricePerNight}</td>
                <td>{String(r.refundable)}</td>
                <td>{r.createdAt ?? "-"}</td>
                <td>
                  <button onClick={() => navigate(`/rooms/${r.roomId}`)}>상세</button>{" "}
                  <button onClick={() => navigate(`/rooms/${r.roomId}/edit`)}>수정</button>{" "}
                  <button onClick={() => onDelete(r.roomId)}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RoomList;
