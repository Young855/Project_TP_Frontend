import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createItinerary } from "../../api/itineraryAPI";

/**
 * 여행 일정 생성
 * - title(필수, ≤255)
 * - startDate/endDate(필수, endDate >= startDate)
 * - generatedFrom(필수) : 백엔드 Enum과 동일 문자열 사용 필요
 */
const GENERATED_FROM = ["RECOMMENDED", "MANUAL"]; // 백엔드 enum 값에 맞게 조정

const ItineraryCreate = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [generatedFrom, setGeneratedFrom] = useState(GENERATED_FROM[0]);

  // 필요 시 userId를 명시적으로 보내야 한다면 주석 해제
  // const [userId, setUserId] = useState("");

  const [errMsg, setErrMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const t = title.trim();
    if (!t) return "제목을 입력하세요.";
    if (t.length > 255) return "제목은 최대 255자입니다.";
    if (!startDate) return "시작일을 선택하세요.";
    if (!endDate) return "종료일을 선택하세요.";
    if (endDate < startDate) return "종료일은 시작일 이후여야 합니다.";
    if (!generatedFrom) return "생성 방식을 선택하세요.";
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
        title: title.trim(),
        startDate,
        endDate,
        generatedFrom,
        // ...(userId ? { userId: Number(userId) } : {}) // 정책에 따라 사용
      };

      const res = await createItinerary(body);
      const newId = res?.itineraryId;
      if (newId) navigate(`/itineraries/${newId}`);
      else navigate("/itineraries");
    } catch (e) {
      console.error(e);
      if (e?.response?.status === 400) setErrMsg(e?.response?.data?.message || "필드 검증에 실패했습니다.");
      else setErrMsg("일정 생성에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h1>여행 일정 생성</h1>
      {errMsg && <div style={{ color: "red", margin: "8px 0" }}>{errMsg}</div>}

      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label>
            제목 (≤255){" "}
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={255}
              required
              placeholder="예: 부산 2박3일 힐링 코스"
            />
          </label>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>
            시작일{" "}
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
          </label>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>
            종료일{" "}
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
          </label>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>
            생성 방식{" "}
            <select value={generatedFrom} onChange={(e) => setGeneratedFrom(e.target.value)}>
              {GENERATED_FROM.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </label>
        </div>

        {/* 인증 컨텍스트 대신 userId 직접 전달해야 하는 정책이라면 사용
        <div style={{ marginBottom: 10 }}>
          <label>
            사용자 ID (옵션){" "}
            <input type="number" value={userId} onChange={(e) => setUserId(e.target.value)} />
          </label>
        </div> */}

        <div>
          <button type="submit" disabled={submitting}>{submitting ? "생성 중..." : "생성"}</button>{" "}
          <button type="button" onClick={() => navigate("/itineraries")}>목록</button>
        </div>
      </form>
    </div>
  );
};

export default ItineraryCreate;
