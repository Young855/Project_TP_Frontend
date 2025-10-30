import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getItineraryItem, updateItineraryItem } from "../../api/itineraryItemAPI";

/**
 * 일정 항목 수정 (중첩형 바디)
 */
const ITEM_TYPES = ["ACCOMMODATION", "POI"]; // 백엔드 enum과 반드시 일치

const ItineraryItemEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [itineraryId, setItineraryId] = useState(""); // 수정 시 보통 변경하지 않지만 입력값 열어둠
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [itemType, setItemType] = useState(ITEM_TYPES[0]);
  const [refId, setRefId] = useState("");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [sortOrder, setSortOrder] = useState("");

  const [errMsg, setErrMsg] = useState("");
  const [loading, setLoading] = useState(true);
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

  const load = async () => {
    try {
      setLoading(true);
      setErrMsg("");
      const data = await getItineraryItem(id);
      setItineraryId(data?.itinerary?.itineraryId || data?.itineraryId || "");
      setStartTime(data?.startTime || "");
      setEndTime(data?.endTime || "");
      setItemType(data?.itemType || ITEM_TYPES[0]);
      setRefId(data?.refId ?? "");
      setTitle(data?.title || "");
      setNote(data?.note ?? "");
      setLatitude(data?.latitude ?? "");
      setLongitude(data?.longitude ?? "");
      setSortOrder(data?.sortOrder ?? "");
    } catch (e) {
      console.error(e);
      setErrMsg("기존 데이터를 불러오지 못했습니다.");
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

      await updateItineraryItem(id, body);
      navigate(`/itinerary-items/${id}`);
    } catch (e) {
      console.error(e);
      if (e?.response?.status === 400) setErrMsg(e?.response?.data?.message || "필드 검증에 실패했습니다.");
      else setErrMsg("일정 항목 수정에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return <div>로딩 중...</div>;

  return (
    <div style={{ padding: 16 }}>
      <h1>일정 항목 수정</h1>
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
          <button type="submit" disabled={submitting}>{submitting ? "수정 중..." : "수정"}</button>{" "}
          <button type="button" onClick={() => navigate(`/itinerary-items/${id}`)}>상세</button>
        </div>
      </form>
    </div>
  );
};

export default ItineraryItemEdit;
