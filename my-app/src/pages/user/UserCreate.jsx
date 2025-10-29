import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUser } from "../../api/userAPI";

/**
 * 유저 생성
 * - password는 평문 입력 → 백엔드가 해시하여 저장하는 전제를 권장
 */
const ROLES = ["ADMIN", "PARTNER", "USER"]; // ★ 실제 AccountRole enum 값으로 수정하세요

const UserCreate = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // 서버에서 해시 저장
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [role, setRole] = useState(ROLES[ROLES.length - 1]); // 기본 USER 가정

  const [errMsg, setErrMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const emailOk = (v) => /\S+@\S+\.\S+/.test(v);

  const validate = () => {
    const e = email.trim();
    if (!e || e.length > 255 || !emailOk(e)) return "유효한 이메일을 입력하세요.";
    if (!password || password.length < 8) return "비밀번호는 8자 이상 입력하세요.";
    const n = name.trim();
    if (!n || n.length > 50) return "이름을 입력하세요(최대 50자).";
    const nn = nickname.trim();
    if (!nn || nn.length > 50) return "닉네임을 입력하세요(최대 50자).";
    if (phone && phone.length > 30) return "전화번호는 최대 30자입니다.";
    if (!role) return "권한을 선택하세요.";
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) { setErrMsg(v); return; }

    try {
      setSubmitting(true);
      setErrMsg("");

      // 일반적으로 백엔드 DTO는 password(평문)를 받고 passwordHash 생성
      const body = {
        email: email.trim(),
        password: password, // 서버에서 해시
        name: name.trim(),
        nickname: nickname.trim(),
        phone: phone.trim() || null,
        birthDate: birthDate || null, // YYYY-MM-DD
        role,
      };

      const res = await createUser(body);
      const newId = res?.userId;
      navigate(newId ? `/users/${newId}` : "/users");
    } catch (e) {
      console.error(e);
      if (e?.response?.status === 409) setErrMsg("이메일 또는 닉네임이 이미 존재합니다.");
      else if (e?.response?.status === 400) setErrMsg(e?.response?.data?.message || "필드 검증에 실패했습니다.");
      else setErrMsg("유저 생성에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h1>유저 생성</h1>
      {errMsg && <div style={{ color: "red", margin: "8px 0" }}>{errMsg}</div>}

      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label>
            Email{" "}
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} required />
          </label>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>
            Password (≥8){" "}
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
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
            <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
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

        <div>
          <button type="submit" disabled={submitting}>{submitting ? "생성 중..." : "생성"}</button>{" "}
          <button type="button" onClick={() => navigate("/users")}>목록</button>
        </div>
      </form>
    </div>
  );
};

export default UserCreate;
