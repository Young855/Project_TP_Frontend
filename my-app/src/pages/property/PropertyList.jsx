import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllProperties, deleteProperty } from "../../api/propertyAPI";

/**
 * 숙소 목록
 */
const PropertyList = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setErrMsg("");
      const data = await getAllProperties();
      setItems(Array.isArray(data) ? data : data?.content || []);
    } catch (e) {
      console.error(e);
      setErrMsg("숙소 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteProperty(id);
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
      <h1>숙소 목록</h1>
      {errMsg && <div style={{ color: "red", margin: "8px 0" }}>{errMsg}</div>}

      <div style={{ margin: "12px 0" }}>
        <button onClick={() => navigate("/properties/create")}>+ 새 숙소</button>
      </div>

      {items.length === 0 ? (
        <div>데이터가 없습니다.</div>
      ) : (
        <table border="1" cellPadding="8" cellSpacing="0" width="100%">
          <thead>
            <tr>
              <th>ID</th>
              <th>Partner</th>
              <th>Type</th>
              <th>Name</th>
              <th>City</th>
              <th>Rating</th>
              <th>Check-in/out</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.propertyId}>
                <td>{p.propertyId}</td>
                <td>{p.partner?.partnerId ?? p.partnerId ?? "-"}</td>
                <td>{p.accountRole}</td>
                <td>{p.name}</td>
                <td>{p.city ?? "-"}</td>
                <td>{p.ratingAvg ?? "-"}</td>
                <td>
                  {(p.checkinTime || "-")}{p.checkoutTime ? ` / ${p.checkoutTime}` : ""}
                </td>
                <td>
                  <button onClick={() => navigate(`/properties/${p.propertyId}`)}>상세</button>{" "}
                  <button onClick={() => navigate(`/properties/${p.propertyId}/edit`)}>수정</button>{" "}
                  <button onClick={() => onDelete(p.propertyId)}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PropertyList;
