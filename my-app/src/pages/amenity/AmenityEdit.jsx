import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

/**
 * 편의시설 수정 페이지
 * - GET /api/amenities/{id} 로 초기값 로드
 * - PUT /api/amenities/{id}
 * - code/name 길이 검증
 */
const AmenityEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (!code.trim()) return "코드를 입력해주세요.";
    if (code.length > 50) return "코드는 최대 50자입니다.";
    if (!name.trim()) return "이름을 입력해주세요.";
    if (name.length > 100) return "이름은 최대 100자입니다.";
    return "";
  };

  const load = async () => {
    try {
      setLoading(true);
      setErrMsg("");
      const res = await axios.get(`/api/amenities/${id}`);
      setCode(res.data.code || "");
      setName(res.data.name || "");
    } catch (err) {
      console.error(err);
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
      await axios.put(`/api/amenities/${id}`, { code: code.trim(), name: name.trim() });
      navigate(`/amenities/${id}`);
    } catch (err) {
      console.error(err);
      if (err?.response?.status === 409) {
        setErrMsg("코드가 이미 존재합니다.");
      } else if (err?.response?.status === 400) {
        setErrMsg(err?.response?.data?.message || "필드 검증에 실패했습니다.");
      } else {
        setErrMsg("수정에 실패했습니다.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return <div>로딩 중...</div>;

  return (
    <div style={{ padding: 16 }}>
      <h1>편의시설 수정</h1>
      {errMsg && <div style={{ color: "red", margin: "8px 0" }}>{errMsg}</div>}
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>
            코드 (최대 50자){" "}
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
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
              maxLength={100}
              required
            />
          </label>
        </div>
        <div>
          <button type="submit" disabled={submitting}>
            {submitting ? "수정 중..." : "수정"}
          </button>{" "}
          <button type="button" onClick={() => navigate(`/amenities/${id}`)}>
            상세로
          </button>
        </div>
      </form>
    </div>
  );
};

export default AmenityEdit;
