import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

/**
 * 편의시설 생성 페이지
 * - POST /api/amenities
 * - code: 필수, 최대 50
 * - name: 필수, 최대 100
 */
const AmenityCreate = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (!code.trim()) return "코드를 입력해주세요.";
    if (code.length > 50) return "코드는 최대 50자입니다.";
    if (!name.trim()) return "이름을 입력해주세요.";
    if (name.length > 100) return "이름은 최대 100자입니다.";
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) { setErrMsg(v); return; }

    try {
      setSubmitting(true);
      setErrMsg("");
      // 백엔드가 생성 시 전체 객체 또는 id를 반환한다고 가정
      const res = await axios.post("/api/amenities", { code: code.trim(), name: name.trim() });
      const newId = res.data?.amenityId ?? null;
      if (newId) navigate(`/amenities/${newId}`);
      else navigate("/amenities");
    } catch (err) {
      console.error(err);
      // Unique 제약 위반 가정(409)
      if (err?.response?.status === 409) {
        setErrMsg("코드가 이미 존재합니다.");
      } else if (err?.response?.status === 400) {
        setErrMsg(err?.response?.data?.message || "필드 검증에 실패했습니다.");
      } else {
        setErrMsg("생성에 실패했습니다.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h1>편의시설 등록</h1>
      {errMsg && <div style={{ color: "red", margin: "8px 0" }}>{errMsg}</div>}
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>
            코드 (최대 50자){" "}
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="예: WIFI, PARKING"
              maxLength={50}
              required
            />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>
            이름 (최대 100자){" "}
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 와이파이, 주차장"
              maxLength={100}
              required
            />
          </label>
        </div>
        <div>
          <button type="submit" disabled={submitting}>
            {submitting ? "등록 중..." : "등록"}
          </button>{" "}
          <button type="button" onClick={() => navigate("/amenities")}>
            목록으로
          </button>
        </div>
      </form>
    </div>
  );
};

export default AmenityCreate;
