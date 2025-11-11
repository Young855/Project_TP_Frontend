import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { addFavorite, getFavorites, removeFavorite } from "../../api/favoriteAPI";

export default function FavoriteEdit({ userId }) {
  const { id } = useParams();
  const [targetType, setTargetType] = useState("");
  const [targetId, setTargetId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const list = await getFavorites(userId);
        const fav = list.find((f) => String(f.favoriteId) === id);
        if (fav) {
          setTargetType(fav.targetType);
          setTargetId(fav.targetId);
        }
      } catch (err) {
        console.error("수정 데이터 불러오기 오류:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId, id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await removeFavorite(userId, targetType, targetId);
      await addFavorite(userId, { targetType, targetId });
      alert ("찜이 수정되었다.");
      Navigate("/favorites");
    } catch (err) {
      alert("수정 실패:" + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>로 딩 중 . . . </div>;

  return (
    <div>
      <h2>찜 수정</h2>
      <form onSubmit={handleUpdate} style={{ display: "grid", gap: 12, maxWidth: 400}}>
        <label>
          대상 종류
          <select value={targetType}
           onChange={(e) => setTargetType(e.target.value)}
           >
            <option value="PROPERTY">숙소</option>
            <option value="REVIEW">리뷰</option>
            <option value="POST">게시글</option>
          </select>
        </label>

        <label>
          대상 ID
          <input 
            type="number"
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "저장 중..." : "저장"}
        </button>
      </form>
    </div>
  );
}