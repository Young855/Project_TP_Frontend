import React from "react";
import { useNavigate, useParams } from "react-router-dom";

/**
 * 즐겨찾기 수정
 * - 현재 백엔드에 PUT/UPDATE 엔드포인트가 없어 수정 불가
 * - 안내 화면: 필요 시 삭제 후 재생성하도록 유도
 */
const FavoriteEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div style={{ padding: 16 }}>
      <h1>즐겨찾기 수정</h1>
      <div style={{ margin: "12px 0", color: "#b45309" }}>
        현재 시스템에서는 즐겨찾기 수정(UPDATE)을 지원하지 않습니다.
        <br />
        변경이 필요하다면 <b>기존 즐겨찾기를 삭제</b>하고 <b>새로 생성</b>해 주세요.
      </div>
      <div>
        <button onClick={() => navigate(`/favorites/${id}`)}>상세로</button>{" "}
        <button onClick={() => navigate("/favorites")}>목록으로</button>{" "}
        <button onClick={() => navigate("/favorites/create")}>새로 생성</button>
      </div>
    </div>
  );
};

export default FavoriteEdit;
