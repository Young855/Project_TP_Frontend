import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// 경로/파일명은 실제 위치에 맞게 수정
import { getAllFavorites, deleteFavorite } from "../../api/favoriteAPI";

/**
 * 즐겨찾기 목록
 * - GET /favorites
 * - 상세/삭제, 생성 이동
 */
const FavoriteList = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setErrMsg("");
      const data = await getAllFavorites();
      setItems(Array.isArray(data) ? data : data?.content || []);
    } catch (e) {
      console.error(e);
      setErrMsg("즐겨찾기 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteFavorite(id);
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
      <h1>즐겨찾기 목록</h1>
      {errMsg && <div style={{ color: "red", margin: "8px 0" }}>{errMsg}</div>}

      <div style={{ margin: "12px 0" }}>
        <button onClick={() => navigate("/favorites/create")}>+ 즐겨찾기 추가</button>
      </div>

      {items.length === 0 ? (
        <div>데이터가 없습니다.</div>
      ) : (
        <table border="1" cellPadding="8" cellSpacing="0" width="100%">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Target Type</th>
              <th>Target ID</th>
              <th>Created At</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {items.map((f) => (
              <tr key={f.favoriteId}>
                <td>{f.favoriteId}</td>
                <td>{f.user?.username || f.user?.email || f.user?.userId || "-"}</td>
                <td>{f.targetType}</td>
                <td>{f.targetId}</td>
                <td>{f.createdAt}</td>
                <td>
                  <button onClick={() => navigate(`/favorites/${f.favoriteId}`)}>상세</button>{" "}
                  <button onClick={() => onDelete(f.favoriteId)}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FavoriteList;
