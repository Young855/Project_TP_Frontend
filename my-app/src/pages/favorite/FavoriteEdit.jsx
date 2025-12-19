import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { addFavorite, getFavorites, removeFavorite } from "../../api/favoriteAPI";

export default function FavoriteEdit({ userId }) {
  const { id } = useParams();
  const [accommodationId, setAccommodationId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const list = await getFavorites(userId);
        const fav = list.find((f) => String(f.favoriteId) === id);
        if (fav) {
        setAccommodationId(fav.accommodationId);
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
      alert ("찜이 수정 기능 준비 중입니다.");
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
          숙소 ID
          <input 
            type="number"
            value={accommodationId}
            onChange={(e) => setAccommodationId(e.target.value)}
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "저장 중..." : "저장"}
        </button>
      </form>
    </div>
  );
}