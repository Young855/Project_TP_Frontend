import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProperty, deleteProperty } from "../../api/propertyAPI";

/**
 * 숙소 상세
 */
const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setErrMsg("");
      const data = await getProperty(id);
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
      await deleteProperty(id);
      navigate("/properties");
    } catch (e) {
      console.error(e);
      alert("삭제에 실패했습니다.");
    }
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return <div>로딩 중...</div>;
  if (errMsg) return <div style={{ color: "red" }}>{errMsg}</div>;
  if (!item) return <div>데이터가 없습니다.</div>;

  const partnerPk = item.partner?.partnerId ?? item.partnerId;

  return (
    <div style={{ padding: 16 }}>
      <h1>숙소 상세</h1>

      <div style={{ margin: "8px 0" }}><b>ID:</b> {item.propertyId}</div>
      <div style={{ margin: "8px 0" }}><b>Partner:</b> {partnerPk ?? "-"}</div>
      <div style={{ margin: "8px 0" }}><b>Type:</b> {item.accountRole}</div>
      <div style={{ margin: "8px 0" }}><b>Name:</b> {item.name}</div>
      <div style={{ margin: "8px 0" }}><b>Description:</b> {item.description ?? "-"}</div>
      <div style={{ margin: "8px 0" }}><b>Address:</b> {item.address}</div>
      <div style={{ margin: "8px 0" }}><b>City:</b> {item.city ?? "-"}</div>
      <div style={{ margin: "8px 0" }}><b>Lat/Lng:</b> {(item.latitude ?? "-")} / {(item.longitude ?? "-")}</div>
      <div style={{ margin: "8px 0" }}><b>Check-in:</b> {item.checkinTime ?? "-"}</div>
      <div style={{ margin: "8px 0" }}><b>Check-out:</b> {item.checkoutTime ?? "-"}</div>
      <div style={{ margin: "8px 0" }}><b>Rating:</b> {item.ratingAvg ?? "-"}</div>
      <div style={{ margin: "8px 0" }}><b>Created:</b> {item.createdAt}</div>
      <div style={{ margin: "8px 0" }}><b>Updated:</b> {item.updatedAt}</div>

      <div style={{ marginTop: 16 }}>
        <button onClick={() => navigate(`/properties/${id}/edit`)}>수정</button>{" "}
        <button onClick={onDelete}>삭제</button>{" "}
        <button onClick={() => navigate("/properties")}>목록</button>
      </div>
    </div>
  );
};

export default PropertyDetail;
