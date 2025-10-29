import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getItineraryItem, deleteItineraryItem } from "../../api/ItineraryItemAPI";

/**
 * 일정 항목 상세
 */
const ItineraryItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setErrMsg("");
      const data = await getItineraryItem(id);
      setItem(data);
    } catch (e) {
      console.error(e);
      setErrMsg("상세 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteItineraryItem(id);
      navigate("/itinerary-items");
    } catch (e) {
      console.error(e);
      alert("삭제에 실패했습니다.");
    }
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return <div>로딩 중...</div>;
  if (errMsg) return <div style={{ color: "red" }}>{errMsg}</div>;
  if (!item) return <div>데이터가 없습니다.</div>;

  const itineraryPk = item.itinerary?.itineraryId || item.itineraryId;

  return (
    <div style={{ padding: 16 }}>
      <h1>일정 항목 상세</h1>

      <div style={{ margin: "8px 0" }}><b>ID:</b> {item.itemId}</div>
      <div style={{ margin: "8px 0" }}><b>Itinerary:</b> {itineraryPk || "-"}</div>
      <div style={{ margin: "8px 0" }}><b>Type:</b> {item.itemType}</div>
      <div style={{ margin: "8px 0" }}><b>Ref ID:</b> {item.refId ?? "-"}</div>
      <div style={{ margin: "8px 0" }}><b>Title:</b> {item.title}</div>
      <div style={{ margin: "8px 0" }}><b>Note:</b> {item.note ?? "-"}</div>
      <div style={{ margin: "8px 0" }}><b>Time:</b> {(item.startTime || "-")}{item.endTime ? ` ~ ${item.endTime}` : ""}</div>
      <div style={{ margin: "8px 0" }}><b>Lat/Lng:</b> {(item.latitude ?? "-")} / {(item.longitude ?? "-")}</div>
      <div style={{ margin: "8px 0" }}><b>Sort:</b> {item.sortOrder ?? "-"}</div>

      <div style={{ marginTop: 16 }}>
        <button onClick={() => navigate(`/itinerary-items/${id}/edit`)}>수정</button>{" "}
        <button onClick={onDelete}>삭제</button>{" "}
        <button onClick={() => navigate("/itinerary-items")}>목록</button>
      </div>
    </div>
  );
};

export default ItineraryItemDetail;
