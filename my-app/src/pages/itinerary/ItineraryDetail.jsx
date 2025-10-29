import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getItinerary, deleteItinerary } from "../../api/itineraryAPI";

/**
 * 여행 일정 상세
 */
const ItineraryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setErrMsg("");
      const data = await getItinerary(id);
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
      await deleteItinerary(id);
      navigate("/itineraries");
    } catch (e) {
      console.error(e);
      alert("삭제에 실패했습니다.");
    }
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return <div>로딩 중...</div>;
  if (errMsg) return <div style={{ color: "red" }}>{errMsg}</div>;
  if (!item) return <div>데이터가 없습니다.</div>;

  return (
    <div style={{ padding: 16 }}>
      <h1>여행 일정 상세</h1>

      <div style={{ margin: "8px 0" }}><b>ID:</b> {item.itineraryId}</div>
      <div style={{ margin: "8px 0" }}><b>제목:</b> {item.title}</div>
      <div style={{ margin: "8px 0" }}><b>기간:</b> {item.startDate} ~ {item.endDate}</div>
      <div style={{ margin: "8px 0" }}><b>생성방식:</b> {item.generatedFrom}</div>
      <div style={{ margin: "8px 0" }}><b>소유자:</b> {item.user?.username || item.user?.email || item.user?.userId || "-"}</div>
      <div style={{ margin: "8px 0" }}><b>생성일:</b> {item.createdAt}</div>

      <div style={{ marginTop: 16 }}>
        <button onClick={() => navigate(`/itineraries/${id}/edit`)}>수정</button>{" "}
        <button onClick={onDelete}>삭제</button>{" "}
        <button onClick={() => navigate("/itineraries")}>목록</button>
      </div>
    </div>
  );
};

export default ItineraryDetail;
