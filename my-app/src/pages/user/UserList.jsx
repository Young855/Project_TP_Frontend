import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllUsers, deleteUser } from "../../api/userAPI";

/**
 * 유저 목록
 */
const UserList = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setErrMsg("");
      const data = await getAllUsers();
      setItems(Array.isArray(data) ? data : data?.content || []);
    } catch (e) {
      console.error(e);
      setErrMsg("유저 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteUser(id);
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
      <h1>유저 목록</h1>
      {errMsg && <div style={{ color: "red", margin: "8px 0" }}>{errMsg}</div>}

      <div style={{ margin: "12px 0" }}>
        <button onClick={() => navigate("/users/create")}>+ 새 유저</button>
      </div>

      {items.length === 0 ? (
        <div>데이터가 없습니다.</div>
      ) : (
        <table border="1" cellPadding="8" cellSpacing="0" width="100%">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Name</th>
              <th>Nickname</th>
              <th>Role</th>
              <th>Deleted</th>
              <th>Created</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.userId}>
                <td>{u.userId}</td>
                <td>{u.email}</td>
                <td>{u.name}</td>
                <td>{u.nickname}</td>
                <td>{u.role}</td>
                <td>{String(u.deleted ?? u.isDeleted)}</td>
                <td>{u.createdAt ?? "-"}</td>
                <td>
                  <button onClick={() => navigate(`/users/${u.userId}`)}>상세</button>{" "}
                  <button onClick={() => navigate(`/users/${u.userId}/edit`)}>수정</button>{" "}
                  <button onClick={() => onDelete(u.userId)}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserList;
