import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProperty } from "../../api/propertyAPI";

/**
 * 숙소 생성
 * - 기본: 평면형 바디 { partnerId, accountRole, ... }
 * - 백엔드가 중첩형 요구 시: body.partner = { partnerId } 로 전환(아래 주석 참고)
 */
const PROPERTY_TYPES = ["HOTEL", "MOTEL", "PENSION", "HOSTEL"]; // ★ 실제 Enum에 맞게 수정하세요

const PropertyCreate = () => {
  const navigate = useNavigate();

  const [partnerId, setPartnerId] = useState("");
  const [accountRole, setAccountRole] = useState(PROPERTY_TYPES[0]); // 숙소 유형
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [checkinTime, setCheckinTime] = useState("");
  const [checkoutTime, setCheckoutTime] = useState("");
  const [ratingAvg, setRatingAvg] = useState("");

  const [errMsg, setErrMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (!partnerId || Number(partnerId) <= 0) return "partnerId를 올바르게 입력하세요.";
    if (!accountRole) return "숙소 유형을 선택하세요.";
    const n = name.trim();
    if (!n) return "숙소명을 입력하세요.";
    if (n.length > 255) return "숙소명은 최대 255자입니다.";
    const a = address.trim();
    if (!a) return "주소를 입력하세요.";
    if (a.length > 255) return "주소는 최대 255자입니다.";
    if (city && city.length > 100) return "도시는 최대 100자입니다.";
    if (checkinTime && checkoutTime && checkoutTime < checkinTime) return "체크아웃은 체크인 이후여야 합니다.";
    if (ratingAvg !== "" && (Number(ratingAvg) < 0 || Number(ratingAvg) > 5)) return "평점은 0~5 사이여야 합니다.";
    return "";
  };

  const toFloatOrNull = (v) => (v === "" ? null : parseFloat(v));
  const toNullIfEmpty = (v) => (v === "" ? null : v);

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) { setErrMsg(v); return; }

    try {
      setSubmitting(true);
      setErrMsg("");

      // 기본: 평면형 요청 바디
      const body = {
        partnerId: Number(partnerId),
        accountRole,
        name: name.trim(),
        description: toNullIfEmpty(description.trim()),
        address: address.trim(),
        city: toNullIfEmpty(city.trim()),
        latitude: toFloatOrNull(latitude),
        longitude: toFloatOrNull(longitude),
        checkinTime: toNullIfEmpty(checkinTime),
        checkoutTime: toNullIfEmpty(checkoutTime),
        ratingAvg: ratingAvg === "" ? null : Number(ratingAvg),
      };

      /* 만약 백엔드가 중첩형을 요구한다면 위 body 대신 아래 형식을 사용:
      const body = {
        partner: { partnerId: Number(partnerId) },
        accountRole,
        name: name.trim(),
        description: toNullIfEmpty(description.trim()),
        address: address.trim(),
        city: toNullIfEmpty(city.trim()),
        latitude: toFloatOrNull(latitude),
        longitude: toFloatOrNull(longitude),
        checkinTime: toNullIfEmpty(checkinTime),
        checkoutTime: toNullIfEmpty(checkoutTime),
        ratingAvg: ratingAvg === "" ? null : Number(ratingAvg),
      };
      */

      const res = await createProperty(body);
      const newId = res?.propertyId;
      navigate(newId ? `/properties/${newId}` : "/properties");
    } catch (e) {
      console.error(e);
      if (e?.response?.status === 400) setErrMsg(e?.response?.data?.message || "필드 검증에 실패했습니다.");
      else setErrMsg("숙소 생성에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h1>숙소 생성</h1>
      {errMsg && <div style={{ color: "red", margin: "8px 0" }}>{errMsg}</div>}

      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label>
            Partner ID{" "}
            <input type="number" value={partnerId} onChange={(e) => setPartnerId(e.target.value)} required />
          </label>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>
            숙소 유형{" "}
            <select value={accountRole} onChange={(e) => setAccountRole(e.target.value)}>
              {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>
            숙소명 (≤255){" "}
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={255} required />
          </label>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>
            설명{" "}
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </label>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>
            주소 (≤255){" "}
            <input value={address} onChange={(e) => setAddress(e.target.value)} maxLength={255} required />
          </label>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>
            도시 (≤100){" "}
            <input value={city} onChange={(e) => setCity(e.target.value)} maxLength={100} />
          </label>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>
            위도{" "}
            <input type="number" step="0.0000001" value={latitude} onChange={(e) => setLatitude(e.target.value)} />
          </label>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>
            경도{" "}
            <input type="number" step="0.0000001" value={longitude} onChange={(e) => setLongitude(e.target.value)} />
          </label>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>
            체크인{" "}
            <input type="time" value={checkinTime} onChange={(e) => setCheckinTime(e.target.value)} />
          </label>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>
            체크아웃{" "}
            <input type="time" value={checkoutTime} onChange={(e) => setCheckoutTime(e.target.value)} />
          </label>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>
            평균 평점(0~5, 소수2){" "}
            <input type="number" step="0.01" min={0} max={5} value={ratingAvg} onChange={(e) => setRatingAvg(e.target.value)} />
          </label>
        </div>

        <div>
          <button type="submit" disabled={submitting}>{submitting ? "생성 중..." : "생성"}</button>{" "}
          <button type="button" onClick={() => navigate("/properties")}>목록</button>
        </div>
      </form>
    </div>
  );
};

export default PropertyCreate;
