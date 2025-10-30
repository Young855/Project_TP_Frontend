import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUser, deleteUser } from "../../api/userAPI";

/**
 * 유저 상세
 */
const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setErrMsg("");
      const data = await getUser(id);
      setItem(data);
    } catch (e) {
      console.error(e);
      setErrMsg("상세 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteUser(id);
      navigate("/users");
    } catch (e) {
      console.error(e);
      alert("삭제에 실패했습니다.");
    }
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return <div>로딩 중...</div>;
  if (errMsg) return <div style={{ color: "red" }}>{errMsg}</div>;
  if (!item) return <div>데이터가 없습니다.</div>;

  return (
    <div style={{ padding: 16 }}>
      <h1>유저 상세</h1>

      <div style={{ margin: "8px 0" }}><b>ID:</b> {item.userId}</div>
      <div style={{ margin: "8px 0" }}><b>Email:</b> {item.email}</div>
      <div style={{ margin: "8px 0" }}><b>Name:</b> {item.name}</div>
      <div style={{ margin: "8px 0" }}><b>Nickname:</b> {item.nickname}</div>
      <div style={{ margin: "8px 0" }}><b>Phone:</b> {item.phone ?? "-"}</div>
      <div style={{ margin: "8px 0" }}><b>Birth Date:</b> {item.birthDate ?? "-"}</div>
      <div style={{ margin: "8px 0" }}><b>Role:</b> {item.role}</div>
      <div style={{ margin: "8px 0" }}><b>Deleted:</b> {String(item.deleted ?? item.isDeleted)}</div>
      <div style={{ margin: "8px 0" }}><b>Created:</b> {item.createdAt}</div>
      <div style={{ margin: "8px 0" }}><b>Updated:</b> {item.updatedAt}</div>

      <div style={{ marginTop: 16 }}>
        <button onClick={() => navigate(`/users/${id}/edit`)}>수정</button>{" "}
        <button onClick={onDelete}>삭제</button>{" "}
        <button onClick={() => navigate("/users")}>목록</button>
      </div>
    </div>
  );
};

export default UserDetail;
