import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addFavorite } from "../../api/favoriteAPI";

export default function FavoriteCreate({ userId }) {
  const [targetType] = useState("PROPERTY");
  const [targetId, setTargetId] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetId) return alert("숙소를 검색하세요. ");

    try {
      setLoading(true);
      await addFavorite(userId, { targetType, targetId });
      alert("찜이 추가되었습니다!");
      navigate("/favorites");
    } catch (err) {
      alert("찜 추가 실패: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // 🔹 화면 전체 중앙 정렬
    <div
      style={{
        display: "flex",
        justifyContent: "center",   // 가로 중앙
        alignItems: "center",       // 세로 중앙
        minHeight: "80vh",          // 화면 세로 기준 높이 확보
        backgroundColor: "#f9fafb", // (선택) 배경색 살짝
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gap: 12,
          maxWidth: 400,
          width: "100%",
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 24,
          boxShadow: "0 4px 14px rgba(0,0,0,0.06)", // 박스 그림자
        }}
      >
        <h2 style={{ margin: 0, fontSize: 22, textAlign: "center" }}>숙소 이름 검색</h2>

        <label style={{ fontWeight: 500 }}>
          
          <input
            type="number"
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            style={{
              marginTop: 4,
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              outline: "none",
              width: "100%",
            }}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            background: loading ? "#9ca3af" : "#111827",
            color: "#fff",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            minWidth: 160,
            justifySelf: "center", 
          }}
        >
          {loading ? "등록 중 ..." : "찜 추가"}
        </button>
      </form>
    </div>
  );
}
