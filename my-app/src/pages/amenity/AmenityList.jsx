import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

/**
 * 편의시설 목록 페이지
 * - GET /api/amenities 에서 목록 로드
 * - 상세/수정/삭제 네비게이션
 */
const AmenityList = () => {
  const navigate = useNavigate();
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setErrMsg("");
      // 페이지네이션이 없다면 단순 배열로 온다고 가정
      const res = await axios.get("/api/amenities");
      const data = Array.isArray(res.data) ? res.data : res.data?.content || [];
      setAmenities(data);
    } catch (err) {
      console.error(err);
      setErrMsg("목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`/api/amenities/${id}`);
      await load();
    } catch (err) {
      console.error(err);
      alert("삭제에 실패했습니다.");
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div>로딩 중...</div>;

  return (
    <div style={{ padding: 16 }}>
      <h1>편의시설 목록</h1>

      {errMsg && <div style={{ color: "red", margin: "8px 0" }}>{errMsg}</div>}

      <div style={{ margin: "12px 0" }}>
        <button onClick={() => navigate("/amenities/create")}>
          + 새 편의시설 등록
        </button>
      </div>

      {amenities.length === 0 ? (
        <div>등록된 편의시설이 없습니다.</div>
      ) : (
        <table border="1" cellPadding="8" cellSpacing="0" width="100%">
          <thead>
            <tr>
              <th>ID</th>
              <th>코드</th>
              <th>이름</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {amenities.map((a) => (
              <tr key={a.amenityId}>
                <td>{a.amenityId}</td>
                <td>{a.code}</td>
                <td>{a.name}</td>
                <td>
                  <button onClick={() => navigate(`/amenities/${a.amenityId}`)}>
                    상세
                  </button>{" "}
                  <button onClick={() => navigate(`/amenities/${a.amenityId}/edit`)}>
                    수정
                  </button>{" "}
                  <button onClick={() => handleDelete(a.amenityId)}>
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AmenityList;
