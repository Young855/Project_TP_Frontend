import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getHashtag, updateHashtag } from "../../api/hashtagAPI";

/**
 * 해시태그 수정
 * - tag: 필수, 최대 100자
 */
const HashtagEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tag, setTag] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const v = tag.trim();
    if (!v) return "태그를 입력하세요.";
    if (v.length > 100) return "태그는 최대 100자입니다.";
    return "";
  };

  const load = async () => {
    try {
      setLoading(true);
      setErrMsg("");
      const data = await getHashtag(id);
      setTag(data?.tag || "");
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
      await updateHashtag(id, { tag: tag.trim() });
      navigate(`/hashtags/${id}`);
    } catch (e) {
      console.error(e);
      if (e?.response?.status === 409) setErrMsg("이미 존재하는 태그입니다.");
      else if (e?.response?.status === 400) setErrMsg(e?.response?.data?.message || "필드 검증에 실패했습니다.");
      else setErrMsg("수정에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return <div>로딩 중...</div>;

  return (
    <div style={{ padding: 16 }}>
      <h1>해시태그 수정</h1>
      {errMsg && <div style={{ color: "red", margin: "8px 0" }}>{errMsg}</div>}

      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label>
            Tag (최대 100자){" "}
            <input
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              maxLength={100}
              required
            />
          </label>
        </div>

        <div>
          <button type="submit" disabled={submitting}>{submitting ? "수정 중..." : "수정"}</button>{" "}
          <button type="button" onClick={() => navigate(`/hashtags/${id}`)}>상세</button>
        </div>
      </form>
    </div>
  );
};

export default HashtagEdit;
