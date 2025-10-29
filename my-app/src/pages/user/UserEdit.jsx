import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUser, updateUser } from "../../api/userAPI";

/**
 * 유저 수정
 * - password는 비워두면 변경하지 않음
 */
const ROLES = ["ADMIN", "PARTNER", "USER"]; // ★ 실제 AccountRole enum 값으로 수정하세요

const UserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // 옵션
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [role, setRole] = useState(ROLES[ROLES.length - 1]); // USER 기본
  const [isDeleted, setIsDeleted] = useState(false);

  const [errMsg, setErrMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const emailOk = (v) => /\S+@\S+\.\S+/.test(v);

  const validate = () => {
    const e = email.trim();
    if (!e || e.length > 255 || !emailOk(e)) return "유효한 이메일을 입력하세요.";
    const n = name.trim();
    if (!n || n.length > 50) return "이름을 입력하세요(최대 50자).";
    const nn = nickname.trim();
    if (!nn || nn.length > 50) return "닉네임을 입력하세요(최대 50자).";
    if (phone && phone.length > 30) return "전화번호는 최대 30자입니다.";
    if (!role) return "권한을 선택하세요.";
    if (password && password.length < 8) return "비밀번호는 8자 이상 입력하세요.";
    return "";
  };

  const load = async () => {
    try {
      setLoading(true);
      setErrMsg("");
      const data = await getUser(id);
      setEmail(data?.email ?? "");
      setName(data?.name ?? "");
      setNickname(data?.nickname ?? "");
      setPhone(data?.phone ?? "");
      setBirthDate(data?.birthDate ?? "");
      setRole(data?.role ?? ROLES[ROLES.length - 1]);
      setIsDeleted(Boolean(data?.deleted ?? data?.isDeleted));
    } catch (e) {
      console.error(e);
      setErrMsg("기존 유저 정보를 불러오지 못했습니다.");
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

      // password 비어있으면 미전송 → 서버에서 비번 변경 안 함
      const body = {
        email: email.trim(),
        name: name.trim(),
        nickname: nickname.trim(),
        phone: phone.trim() || null,
        birthDate: birthDate || null,
        role,
        isDeleted,
        // password: password || undefined  ← 이 필드명은 서버 DTO에 맞추세요.
      };

      // 서버 DTO가 password(평문)를 허용하면 아래처럼 조건부 포함:
      if (password) body.password = password;

      await updateUser(id, body);
      navigate(`/users/${id}`);
    } catch (e) {
      console.error(e);
      if (e?.response?.status === 409) setErrMsg("이메일 또는 닉네임이 이미 존재합니다.");
      else if (e?.response?.status === 400) setErrMsg(e?.response?.data?.message || "필드 검증에 실패했습니다.");
      else setErrMsg("유저 수정에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return <div>로딩 중...</div>;

  return (
    <div style={{ padding: 16 }}>
      <h1>유저 수정</h1>
      {errMsg && <div style={{ color: "red", margin: "8px 0" }}>{errMsg}</div>}

      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label>
            Email{" "}
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} required />
          </label>
        </div>

        <div style={{ marginBottom: 4, color: "#555" }}>
          비밀번호를 변경하려면 아래에 새 비밀번호를 입력하세요. (미입력 시 기존 유지)
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>
            New Password (옵션, ≥8){" "}
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} />
          </label>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>
            Name (≤50){" "}
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={50} required />
          </label>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>
            Nickname (≤50){" "}
            <input value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={50} required />
          </label>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>
            Phone (≤30){" "}
            <input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} />
          </label>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>
            Birth Date{" "}
            <input type="date" value={birthDate || ""} onChange={(e) => setBirthDate(e.target.value)} />
          </label>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>
            Role{" "}
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>
            Deleted{" "}
            <input type="checkbox" checked={isDeleted} onChange={(e) => setIsDeleted(e.target.checked)} />
          </label>
        </div>

        <div>
          <button type="submit" disabled={submitting}>{submitting ? "수정 중..." : "수정"}</button>{" "}
          <button type="button" onClick={() => navigate(`/users/${id}`)}>상세</button>
        </div>
      </form>
    </div>
  );
};

export default UserEdit;
