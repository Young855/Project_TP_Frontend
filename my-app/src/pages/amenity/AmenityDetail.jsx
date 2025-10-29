import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

/**
 * 편의시설 상세 페이지
 * - GET /api/amenities/{id}
 * - 삭제 제공(옵션)
 */
const AmenityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [amenity, setAmenity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setErrMsg("");
      const res = await axios.get(`/api/amenities/${id}`);
      setAmenity(res.data);
    } catch (err) {
      console.error(err);
      setErrMsg("상세 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`/api/amenities/${id}`);
      navigate("/amenities");
    } catch (err) {
      console.error(err);
      alert("삭제에 실패했습니다.");
    }
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return <div>로딩 중...</div>;
  if (errMsg) return <div style={{ color: "red" }}>{errMsg}</div>;
  if (!amenity) return <div>데이터가 없습니다.</div>;

  return (
    <div style={{ padding: 16 }}>
      <h1>편의시설 상세</h1>
      <div style={{ margin: "8px 0" }}>
        <b>ID:</b> {amenity.amenityId}
      </div>
      <div style={{ margin: "8px 0" }}>
        <b>코드:</b> {amenity.code}
      </div>
      <div style={{ margin: "8px 0" }}>
        <b>이름:</b> {amenity.name}
      </div>

      <div style={{ marginTop: 16 }}>
        <button onClick={() => navigate(`/amenities/${id}/edit`)}>수정</button>{" "}
        <button onClick={handleDelete}>삭제</button>{" "}
        <button onClick={() => navigate("/amenities")}>목록으로</button>
      </div>
    </div>
  );
};

export default AmenityDetail;
