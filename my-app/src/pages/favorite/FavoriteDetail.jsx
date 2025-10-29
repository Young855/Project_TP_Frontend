import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getFavorite, deleteFavorite } from "../../api/favoriteAPI";

/**
 * 즐겨찾기 상세
 * - GET /favorites/{id}
 * - 삭제, 목록/수정(안내) 이동
 */
const FavoriteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setErrMsg("");
      const data = await getFavorite(id);
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
      await deleteFavorite(id);
      navigate("/favorites");
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
      <h1>즐겨찾기 상세</h1>

      <div style={{ margin: "8px 0" }}><b>ID:</b> {item.favoriteId}</div>
      <div style={{ margin: "8px 0" }}>
        <b>User:</b> {item.user?.username || item.user?.email || item.user?.userId || "-"}
      </div>
      <div style={{ margin: "8px 0" }}><b>Target Type:</b> {item.targetType}</div>
      <div style={{ margin: "8px 0" }}><b>Target ID:</b> {item.targetId}</div>
      <div style={{ margin: "8px 0" }}><b>Created At:</b> {item.createdAt}</div>

      <div style={{ marginTop: 16 }}>
        <button onClick={() => navigate(`/favorites/${id}/edit`)}>수정</button>{" "}
        <button onClick={onDelete}>삭제</button>{" "}
        <button onClick={() => navigate("/favorites")}>목록</button>
      </div>
    </div>
  );
};

export default FavoriteDetail;
