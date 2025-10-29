import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// 실제 경로에 맞게 조정
import { getAllHashtags, deleteHashtag } from "../../api/hashtagAPI";

/**
 * 해시태그 목록
 */
const HashtagList = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setErrMsg("");
      const data = await getAllHashtags();
      setItems(Array.isArray(data) ? data : data?.content || []);
    } catch (e) {
      console.error(e);
      setErrMsg("해시태그 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteHashtag(id);
      await load();
    } catch (e) {
      console.error(e);
      alert("삭제에 실패했습니다.");
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div>로딩 중...</div>;

  return (
    <div style={{ padding: 16 }}>
      <h1>해시태그 목록</h1>
      {errMsg && <div style={{ color: "red", margin: "8px 0" }}>{errMsg}</div>}

      <div style={{ margin: "12px 0" }}>
        <button onClick={() => navigate("/hashtags/create")}>+ 새 해시태그</button>
      </div>

      {items.length === 0 ? (
        <div>데이터가 없습니다.</div>
      ) : (
        <table border="1" cellPadding="8" cellSpacing="0" width="100%">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tag</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {items.map((h) => (
              <tr key={h.hashtagId}>
                <td>{h.hashtagId}</td>
                <td>{h.tag}</td>
                <td>
                  <button onClick={() => navigate(`/hashtags/${h.hashtagId}`)}>상세</button>{" "}
                  <button onClick={() => navigate(`/hashtags/${h.hashtagId}/edit`)}>수정</button>{" "}
                  <button onClick={() => onDelete(h.hashtagId)}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default HashtagList;
