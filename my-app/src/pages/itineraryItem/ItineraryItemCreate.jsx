import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createItineraryItem } from "../../api/itineraryItemAPI";

/**
 * 일정 항목 생성 (중첩형 바디)
 */
const ITEM_TYPES = ["ACCOMMODATION", "POI"]; // 백엔드 enum과 반드시 일치

const ItineraryItemCreate = () => {
  const navigate = useNavigate();

  const [itineraryId, setItineraryId] = useState("");
  const [startTime, setStartTime] = useState("");   // HH:mm
  const [endTime, setEndTime] = useState("");       // HH:mm
  const [itemType, setItemType] = useState(ITEM_TYPES[0]);
  const [refId, setRefId] = useState("");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [latitude, setLatitude] = useState("");     // string으로 받아 숫자로 변환
  const [longitude, setLongitude] = useState("");
  const [sortOrder, setSortOrder] = useState("");

  const [errMsg, setErrMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (!itineraryId || Number(itineraryId) <= 0) return "itineraryId를 올바르게 입력하세요.";
    const t = title.trim();
    if (!t) return "제목을 입력하세요.";
    if (t.length > 255) return "제목은 최대 255자입니다.";
    if (!itemType) return "항목 유형을 선택하세요.";
    if (startTime && endTime && endTime < startTime) return "종료 시간은 시작 시간 이후여야 합니다.";
    if (note && note.length > 500) return "메모는 최대 500자입니다.";
    if (sortOrder !== "" && Number(sortOrder) < 0) return "정렬 순서는 0 이상이어야 합니다.";
    return "";
  };

  const toNumberOrNull = (v) => (v === "" || v === null || v === undefined ? null : Number(v));
  const toFloatOrNull = (v) => (v === "" || v === null || v === undefined ? null : parseFloat(v));

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) { setErrMsg(v); return; }

    try {
      setSubmitting(true);
      setErrMsg("");

      const body = {
        itinerary: { itineraryId: Number(itineraryId) },
        startTime: startTime || null,
        endTime: endTime || null,
        itemType,
        refId: toNumberOrNull(refId),
        title: title.trim(),
        note: note.trim() || null,
        latitude: toFloatOrNull(latitude),
        longitude: toFloatOrNull(longitude),
        sortOrder: toNumberOrNull(sortOrder),
      };

      const res = await createItineraryItem(body);
      const newId = res?.itemId;
      if (newId) navigate(`/itinerary-items/${newId}`);
      else navigate("/itinerary-items");
    } catch (e) {
      console.error(e);
      if (e?.response?.status === 400) setErrMsg(e?.response?.data?.message || "필드 검증에 실패했습니다.");
      else setErrMsg("일정 항목 생성에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h1>일정 항목 생성</h1>
      {errMsg && <div style={{ color: "red", margin: "8px 0" }}>{errMsg}</div>}

      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label>
            Itinerary ID{" "}
            <input type="number" value={itineraryId} onChange={(e) => setItineraryId(e.target.value)} required />
          </label>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>
            Type{" "}
            <select value={itemType} onChange={(e) => setItemType(e.target.value)}>
              {ITEM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>
            Title (≤255){" "}
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={255} required />
          </label>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>
            Note (≤500){" "}
            <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} rows={3} />
          </label>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>
            Start Time{" "}
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </label>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>
            End Time{" "}
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </label>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>
            Ref ID{" "}
            <input type="number" value={refId} onChange={(e) => setRefId(e.target.value)} />
          </label>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>
            Latitude{" "}
            <input type="number" step="0.0000001" value={latitude} onChange={(e) => setLatitude(e.target.value)} />
          </label>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>
            Longitude{" "}
            <input type="number" step="0.0000001" value={longitude} onChange={(e) => setLongitude(e.target.value)} />
          </label>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>
            Sort Order{" "}
            <input type="number" min={0} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
          </label>
        </div>

        <div>
          <button type="submit" disabled={submitting}>{submitting ? "생성 중..." : "생성"}</button>{" "}
          <button type="button" onClick={() => navigate("/itinerary-items")}>목록</button>
        </div>
      </form>
    </div>
  );
};

export default ItineraryItemCreate;
