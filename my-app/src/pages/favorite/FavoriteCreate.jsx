import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createFavorite } from "../../api/favoriteAPI";

/**
 * 즐겨찾기 생성
 * - 기본적으로 targetType / targetId만 필요(백엔드 정책에 따라 user는 인증 컨텍스트)
 * - targetType은 enum(TargetType). 현재는 PROPERTY 고정 가능
 */
const FavoriteCreate = () => {
  const navigate = useNavigate();

  // targetType이 고정(PROPERTY)이라면 아래를 상수로 두고 select를 제거해도 됨.
  const [targetType, setTargetType] = useState("PROPERTY");
  const [targetId, setTargetId] = useState("");

  // 필요 시 userId를 직접 넘겨야 하는 백엔드 정책이라면 폼에 추가하세요.
  // const [userId, setUserId] = useState("");

  const [errMsg, setErrMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (!targetType?.trim()) return "targetType을 선택하세요.";
    if (!targetId || Number(targetId) <= 0) return "targetId를 올바르게 입력하세요.";
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) { setErrMsg(v); return; }

    try {
      setSubmitting(true);
      setErrMsg("");

      const body = {
        targetType,
        targetId: Number(targetId),
        // ...(userId ? { userId: Number(userId) } : {}) // 정책에 따라 사용
      };

      const res = await createFavorite(body);
      const newId = res?.favoriteId;
      if (newId) navigate(`/favorites/${newId}`);
      else navigate("/favorites");
    } catch (e) {
      console.error(e);
      setErrMsg("즐겨찾기 생성에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h1>즐겨찾기 추가</h1>
      {errMsg && <div style={{ color: "red", margin: "8px 0" }}>{errMsg}</div>}

      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label>
            Target Type{" "}
            <select value={targetType} onChange={(e) => setTargetType(e.target.value)}>
              <option value="PROPERTY">PROPERTY</option>
              {/* 다른 타입이 생기면 여기에 추가 */}
            </select>
          </label>
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>
            Target ID{" "}
            <input
              type="number"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              min={1}
              required
              placeholder="숙소 ID"
            />
          </label>
        </div>

        {/* 백엔드 정책에 따라 노출 */}
        {/* <div style={{ marginBottom: 10 }}>
          <label>
            User ID (옵션){" "}
            <input type="number" value={userId} onChange={(e) => setUserId(e.target.value)} />
          </label>
        </div> */}

        <div>
          <button type="submit" disabled={submitting}>{submitting ? "생성 중..." : "생성"}</button>{" "}
          <button type="button" onClick={() => navigate("/favorites")}>목록</button>
        </div>
      </form>
    </div>
  );
};

export default FavoriteCreate;
