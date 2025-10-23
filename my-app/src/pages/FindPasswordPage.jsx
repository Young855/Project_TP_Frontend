import React from 'react';

/**
 * 비밀번호 찾기 페이지 (UI Mock)
 * @param {object} props
 * @param {function} props.setPage - 페이지 이동 함수
 */
const FindPasswordPage = ({ setPage }) => {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">비밀번호 찾기</h2>
        <p className="text-center text-gray-600 mb-6">R008: 아이디(이메일) 또는 이름을 통해 비밀번호를 찾을 수 있습니다. (UI만 구현)</p>
        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="form-label">이메일</label>
            <input type="email" id="email" className="form-input" placeholder="가입한 이메일" />
          </div>
          <button type="submit" className="btn-primary w-full text-lg">
            인증 메일 발송
          </button>
        </form>
      </div>
    </div>
  );
};

export default FindPasswordPage;