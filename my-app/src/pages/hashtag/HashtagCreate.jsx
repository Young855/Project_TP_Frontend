import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createHashtag } from "../../api/hashtagAPI";

/**
 * 해시태그 생성
 * - tag: 필수, 최대 100자
 */
const HashtagCreate = () => {
  const navigate = useNavigate();
  const [tag, setTag] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const v = tag.trim();
    if (!v) return "태그를 입력하세요.";
    if (v.length > 100) return "태그는 최대 100자입니다.";
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) { setErrMsg(v); return; }

    try {
      setSubmitting(true);
      setErrMsg("");
      const res = await createHashtag({ tag: tag.trim() });
      const newId = res?.hashtagId;
      if (newId) navigate(`/hashtags/${newId}`);
      else navigate("/hashtags");
    } catch (e) {
      console.error(e);
      // unique 제약 위반 가정(409)
      if (e?.response?.status === 409) setErrMsg("이미 존재하는 태그입니다.");
      else if (e?.response?.status === 400) setErrMsg(e?.response?.data?.message || "필드 검증에 실패했습니다.");
      else setErrMsg("생성에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h1>해시태그 생성</h1>
      {errMsg && <div style={{ color: "red", margin: "8px 0" }}>{errMsg}</div>}

      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label>
            Tag (최대 100자){" "}
            <input
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              maxLength={100}
              placeholder="#힐िंग"
              required
            />
          </label>
        </div>

        <div>
          <button type="submit" disabled={submitting}>{submitting ? "생성 중..." : "생성"}</button>{" "}
          <button type="button" onClick={() => navigate("/hashtags")}>목록</button>
        </div>
      </form>
    </div>
  );
};

export default HashtagCreate;
