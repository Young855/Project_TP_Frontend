// src/pages/favorite/FavoriteList.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFavorites, removeFavorite } from "../../api/favoriteAPI";

export default function FavoriteList({ userId }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const list = await getFavorites(userId);
      setFavorites(list ?? []);
    } catch (err) {
      console.error("목록 불러오기 오류:", err);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [userId]);

  const handleDelete = async (f) => {
    if (!window.confirm("이 찜을 해제하겠습니까?")) return;
    try {
      await removeFavorite(userId, f.targetType, f.targetId);
      await fetchFavorites();
    } catch (err) {
      alert("삭제 실패: " + (err.message || ""));
    }
  };

  if (loading) {
    return <p>찜 목록을 불러오는 중...</p>;
  }

  if (!loading && favorites.length === 0) {
    return <p>찜한 항목이 없습니다.</p>;
  }

  const typeLabel = (t) => {
    switch (t) {
      case "PROPERTY":
        return "숙소";
      case "REVIEW":
        return "리뷰";
      case "POST":
        return "게시글";
      default:
        return t;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 px-3">ID</th>
            <th className="text-left py-2 px-3">종류</th>
            <th className="text-left py-2 px-3">대상</th>
            <th className="text-left py-2 px-3">액션</th>
          </tr>
        </thead>
        <tbody>
          {favorites.map((f) => (
            <tr key={f.favoriteId} className="border-b">
              <td className="py-2 px-3">#{f.favoriteId}</td>
              <td className="py-2 px-3">{typeLabel(f.targetType)}</td>
              <td className="py-2 px-3">
                {f.targetType === "PROPERTY"
                  ? `숙소 #${f.targetId}`
                  : `ID ${f.targetId}`}
              </td>
              <td className="py-2 px-3">
                <Link
                  to={`/favorites/${f.favoriteId}`}
                  className="text-blue-600 hover:underline mr-2"
                >
                  상세
                </Link>
                <Link
                  to={`/favorites/${f.favoriteId}/edit`}
                  className="text-blue-600 hover:underline mr-2"
                >
                  수정
                </Link>
                <button
                  onClick={() => handleDelete(f)}
                  className="text-red-600 hover:underline"
                >
                  해제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
