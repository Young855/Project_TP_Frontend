import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getRoom, deleteRoom } from "../../api/roomAPI";

/**
 * 객실 상세
 */
const RoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setErrMsg("");
      const data = await getRoom(id);
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
      await deleteRoom(id);
      navigate("/rooms");
    } catch (e) {
      console.error(e);
      alert("삭제에 실패했습니다.");
    }
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return <div>로딩 중...</div>;
  if (errMsg) return <div style={{ color: "red" }}>{errMsg}</div>;
  if (!item) return <div>데이터가 없습니다.</div>;

  const propertyPk = item.property?.propertyId ?? item.propertyId;

  return (
    <div style={{ padding: 16 }}>
      <h1>객실 상세</h1>

      <div style={{ margin: "8px 0" }}><b>ID:</b> {item.roomId}</div>
      <div style={{ margin: "8px 0" }}><b>Property:</b> {propertyPk ?? "-"}</div>
      <div style={{ margin: "8px 0" }}><b>Name:</b> {item.name}</div>
      <div style={{ margin: "8px 0" }}><b>Capacity:</b> {item.capacity}</div>
      <div style={{ margin: "8px 0" }}><b>Stock:</b> {item.stock}</div>
      <div style={{ margin: "8px 0" }}><b>Price/Night:</b> {item.pricePerNight}</div>
      <div style={{ margin: "8px 0" }}><b>Refundable:</b> {String(item.refundable)}</div>
      <div style={{ margin: "8px 0" }}><b>Created:</b> {item.createdAt ?? "-"}</div>

      <div style={{ marginTop: 16 }}>
        <button onClick={() => navigate(`/rooms/${id}/edit`)}>수정</button>{" "}
        <button onClick={onDelete}>삭제</button>{" "}
        <button onClick={() => navigate("/rooms")}>목록</button>
      </div>
    </div>
  );
};

export default RoomDetail;
