import { useEffect, useState } from "react"
import { getFavorites, removeFavorite } from "../../api/favoriteAPI";

export default function FavoriteList({ userId }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      const list = await getFavorites(userId);
      setFavorites(list);
    } catch (err) {
      console.error("목록 불러오기 오류:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (f) => {
    if (!window.confirm("이 찜을 해제하겠습니까 ?")) return;
    try {
      await removeFavorite(userId, f.targetType, f.targetId);
      fetchFavorites();
    } catch (err) {
      alert("삭제 실패: " + err.message);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [userId]);

  if(loading) return <div>불러오는 중...</div>;


  return (
    <div>
      <h2>내 찜 목록</h2>
      <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 10}}>
        {favorites.map((f) => {
          <li
            key={f.favoriteId} 
            style={{
              border: "1px solid #eee",
              borderRadius: 10,
              padding: 10,
              display: "grid",
              gap: 6,
            }}
          >
            <div><b>Type:</b> {f.targetType}</div>
            <div><b>Target ID:</b> {f.targetId}</div>

            <div style={{ display: "flex", gap: 8}}>
              <Link to={`/favorites/${f.favoriteId}`}>상세</Link>
              <Link to={`/favorites/${f.favoriteId}/edit`}>수정</Link>
              <button
              onClick={() => handleDelete(f)}
              style={{
                background: "none",
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: "4px 8px",
                cursor: "pointer",
              }}
              >
                해제
              </button>
            </div>
          </li>
        })}
      </ul>
    </div>
  );
}