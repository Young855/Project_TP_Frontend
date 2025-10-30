import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProperty, updateProperty } from "../../api/propertyAPI";

/**
 * 숙소 수정
 * - 기본: 평면형 바디
 * - 백엔드가 중첩형 요구 시 partner: { partnerId }로 전환
 */
const PROPERTY_TYPES = ["HOTEL", "MOTEL", "PENSION", "HOSTEL"]; // ★ 실제 Enum에 맞게 수정하세요

const PropertyEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [partnerId, setPartnerId] = useState("");
  const [accountRole, setAccountRole] = useState(PROPERTY_TYPES[0]);
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
  const [loading, setLoading] = useState(true);
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

  const load = async () => {
    try {
      setLoading(true);
      setErrMsg("");
      const data = await getProperty(id);
      setPartnerId(data?.partner?.partnerId ?? data?.partnerId ?? "");
      setAccountRole(data?.accountRole ?? PROPERTY_TYPES[0]);
      setName(data?.name ?? "");
      setDescription(data?.description ?? "");
      setAddress(data?.address ?? "");
      setCity(data?.city ?? "");
      setLatitude(data?.latitude ?? "");
      setLongitude(data?.longitude ?? "");
      setCheckinTime(data?.checkinTime ?? "");
      setCheckoutTime(data?.checkoutTime ?? "");
      setRatingAvg(data?.ratingAvg ?? "");
    } catch (e) {
      console.error(e);
      setErrMsg("기존 숙소 정보를 불러오지 못했습니다.");
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

      /* 중첩형이 필요하면:
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

      await updateProperty(id, body);
      navigate(`/properties/${id}`);
    } catch (e) {
      console.error(e);
      if (e?.response?.status === 400) setErrMsg(e?.response?.data?.message || "필드 검증에 실패했습니다.");
      else setErrMsg("숙소 수정에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return <div>로딩 중...</div>;

  return (
    <div style={{ padding: 16 }}>
      <h1>숙소 수정</h1>
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
          <button type="submit" disabled={submitting}>{submitting ? "수정 중..." : "수정"}</button>{" "}
          <button type="button" onClick={() => navigate(`/properties/${id}`)}>상세</button>
        </div>
      </form>
    </div>
  );
};

export default PropertyEdit;
