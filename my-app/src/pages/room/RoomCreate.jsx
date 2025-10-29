import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRoom } from "../../api/roomAPI";

/**
 * 객실 생성
 * - 기본: 평면형 바디 { propertyId, name, capacity, stock, pricePerNight, refundable }
 * - 백엔드가 중첩형 요구 시: body.property = { propertyId } 로 전환
 */
const RoomCreate = () => {
  const navigate = useNavigate();

  const [propertyId, setPropertyId] = useState("");
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState(1);
  const [stock, setStock] = useState(0);
  const [pricePerNight, setPricePerNight] = useState(0);
  const [refundable, setRefundable] = useState(true);

  const [errMsg, setErrMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const n = name.trim();
    if (!propertyId || Number(propertyId) <= 0) return "propertyId를 올바르게 입력하세요.";
    if (!n) return "객실명을 입력하세요.";
    if (n.length > 255) return "객실명은 최대 255자입니다.";
    if (capacity === "" || Number(capacity) < 1) return "수용 인원은 1 이상이어야 합니다.";
    if (stock === "" || Number(stock) < 0) return "재고는 0 이상이어야 합니다.";
    if (pricePerNight === "" || Number(pricePerNight) < 0) return "1박 요금은 0 이상이어야 합니다.";
    if (typeof refundable !== "boolean") return "환불 가능 여부를 선택하세요.";
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) { setErrMsg(v); return; }

    try {
      setSubmitting(true);
      setErrMsg("");

      // 평면형 요청 바디
      const body = {
        propertyId: Number(propertyId),
        name: name.trim(),
        capacity: Number(capacity),
        stock: Number(stock),
        pricePerNight: Number(pricePerNight),
        refundable: Boolean(refundable),
      };

      /* 중첩형이 필요하면 위 body 대신 아래 형식 사용:
      const body = {
        property: { propertyId: Number(propertyId) },
        name: name.trim(),
        capacity: Number(capacity),
        stock: Number(stock),
        pricePerNight: Number(pricePerNight),
        refundable: Boolean(refundable),
      };
      */

      const res = await createRoom(body);
      const newId = res?.roomId;
      navigate(newId ? `/rooms/${newId}` : "/rooms");
    } catch (e) {
      console.error(e);
      if (e?.response?.status === 400) setErrMsg(e?.response?.data?.message || "필드 검증에 실패했습니다.");
      else setErrMsg("객실 생성에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h1>객실 생성</h1>
      {errMsg && <div style={{ color: "red", margin: "8px 0" }}>{errMsg}</div>}

      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label>
            Property ID{" "}
            <input type="number" value={propertyId} onChange={(e) => setPropertyId(e.target.value)} required />
          </label>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>
            객실명 (≤255){" "}
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={255} required />
          </label>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>
            수용 인원{" "}
            <input type="number" min={1} value={capacity} onChange={(e) => setCapacity(e.target.value)} required />
          </label>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>
            재고{" "}
            <input type="number" min={0} value={stock} onChange={(e) => setStock(e.target.value)} required />
          </label>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>
            1박 요금{" "}
            <input type="number" min={0} value={pricePerNight} onChange={(e) => setPricePerNight(e.target.value)} required />
          </label>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>
            환불 가능{" "}
            <input type="checkbox" checked={refundable} onChange={(e) => setRefundable(e.target.checked)} />
          </label>
        </div>

        <div>
          <button type="submit" disabled={submitting}>{submitting ? "생성 중..." : "생성"}</button>{" "}
          <button type="button" onClick={() => navigate("/rooms")}>목록</button>
        </div>
      </form>
    </div>
  );
};

export default RoomCreate;
