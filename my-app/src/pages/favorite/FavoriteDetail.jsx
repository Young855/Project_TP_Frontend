import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getFavorites } from "../../api/favoriteAPI";

export default function FavoriteDetail({ userId }){
  const { id } = useParams();
  const [favorite, setFavorite] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect (() => {
    (async () => {
      try {
        const list = await getFavorites(userId);
        const found = list.find((f) => String(f.favoriteId) === id);
        setFavorite(found);
      } catch (err) {
        console.error("상세 조회 오류:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId, id]);

  if (loading) return <div>불러오는 중 ..</div>;
  if (!favorite)return <div>해당 찜 정보를 찾을 수 없다. </div>;

  return (
    <div>
      <h2>찜 상세 정보</h2>
      <p><b>ID:</b> {favorite.favoriteId}</p>
      <p><b>타입:</b> {favorite.targetType}</p>
      <p><b>대상 ID:</b> {favorite.targetId}</p>
      <p><b>사용자:</b> {favorite.userId}</p>

      <Link to="/favorites">← 목록으로 돌아가기</Link>
    </div>
  );

}