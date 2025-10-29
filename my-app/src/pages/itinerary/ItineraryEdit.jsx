import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getItinerary, updateItinerary } from "../../api/itineraryAPI";

/**
 * 여행 일정 수정
 * - 기존 데이터 로드 → 수정
 */
const GENERATED_FROM = ["RECOMMENDED", "MANUAL"]; // 백엔드 enum 값에 맞게 조정

const ItineraryEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [generatedFrom, setGeneratedFrom] = useState(GENERATED_FROM[0]);

  const [errMsg, setErrMsg] = useState("");
  const [loading, setLoading] = useState(true);
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

  const load = async () => {
    try {
      setLoading(true);
      setErrMsg("");
      const data = await getItinerary(id);
      setTitle(data?.title || "");
      setStartDate(data?.startDate || "");
      setEndDate(data?.endDate || "");
      setGeneratedFrom(data?.generatedFrom || GENERATED_FROM[0]);
    } catch (e) {
      console.error(e);
      setErrMsg("기존 일정을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
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
      };
      await updateItinerary(id, body);
      navigate(`/itineraries/${id}`);
    } catch (e) {
      console.error(e);
      if (e?.response?.status === 400) setErrMsg(e?.response?.data?.message || "필드 검증에 실패했습니다.");
      else setErrMsg("일정 수정에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return <div>로딩 중...</div>;

  return (
    <div style={{ padding: 16 }}>
      <h1>여행 일정 수정</h1>
      {errMsg && <div style={{ color: "red", margin: "8px 0" }}>{errMsg}</div>}

      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label>
            제목 (≤255){" "}
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={255} required />
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

        <div>
          <button type="submit" disabled={submitting}>{submitting ? "수정 중..." : "수정"}</button>{" "}
          <button type="button" onClick={() => navigate(`/itineraries/${id}`)}>상세</button>
        </div>
      </form>
    </div>
  );
};

export default ItineraryEdit;
