import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { prepareBooking, createBookingFromToken } from "../../api/bookingAPI";
import { sendVerificationEmail, verifyEmailCode } from "../../api/userAPI";

/**
 * BookingCreate.jsx
 * - 예약 준비: GET /bookings/prepare
 * - 예약 생성: POST /bookings (token 기반)
 * - 이메일 인증: 기존 UserController / EmailService 재사용
 *
 * ✅ 반영
 * 1) cooldown(재전송 60초) 삭제
 * 2) 인증코드 발송 중 다른 버튼 클릭 방지
 * 3) 예약하기(저장) 중 다른 버튼 클릭 방지 + 스피너
 */
export default function BookingCreate() {
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const initial = useMemo(() => {
    const roomIdRaw = Number(params.get("roomId"));
    const roomId = roomIdRaw ? Number(roomIdRaw) : undefined;
    const checkinDate = params.get("checkinDate") || "";
    const checkoutDate = params.get("checkoutDate") || "";
    const userId = Number(params.get("userId")); // 임시
    const tokenFromSession = sessionStorage.getItem("reservationToken") || "";
    return { roomId, checkinDate, checkoutDate, userId, tokenFromSession };
  }, [params]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState(null);

  // ✅ 예약하기(저장) 중 잠금
  const [submitting, setSubmitting] = useState(false);

  // ✅ form에 email 유지 (인증 성공 시 확정)
  const [form, setForm] = useState({
    userId: initial.userId || "",
    email: "",
    guests: 2,
    bookerName: "",
    visitMode: "WALK",
  });

  /**
   * ✅ 이메일 인증 상태
   * - sent: 발송 여부
   * - verified: 인증 성공 여부
   * - sending: 발송 중 여부 (잠금)
   * - verifying: 인증 확인 중 여부 (잠금)
   *
   * 🚫 cooldown 제거 (요구사항)
   */
  const [emailAuth, setEmailAuth] = useState({
    email: "",
    code: "",
    sent: false,
    verified: false,
    sending: false,
    verifying: false,
    message: "",
    error: "",
  });

  // ✅ 전체 잠금 조건
  // - 인증코드 발송 중 / 인증 확인 중 / 예약하기 중 => 다른 버튼 못 누름
  const isLocked = emailAuth.sending || emailAuth.verifying || submitting;

  // DTO가 nested(room)일 수도 있고(flat)일 수도 있어서 안전하게 꺼내기
  const ui = useMemo(() => {
    const room = view?.room;
    return {
      accommodationName: room?.accommodationName ?? view?.accommodationName ?? "",
      roomName: room?.roomName ?? view?.roomName ?? "",
      standardCapacity: room?.standardCapacity ?? view?.standardCapacity ?? "",
      maxCapacity: room?.maxCapacity ?? view?.maxCapacity ?? "",
      checkinDate: view?.checkinDate ?? "",
      checkoutDate: view?.checkoutDate ?? "",
      policies: view?.policies ?? [],
      totalPrice: view?.totalPrice ?? 0,
      token: view?.token ?? sessionStorage.getItem("reservationToken") ?? "",
    };
  }, [view]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const hasToken = !!initial.tokenFromSession;
        const hasQuery =
          Number.isFinite(initial.roomId) &&
          initial.roomId > 0 &&
          !!initial.checkinDate &&
          !!initial.checkoutDate;

        if (!hasToken && !hasQuery) {
          throw new Error("예약 정보가 없습니다. roomId/checkinDate/checkoutDate 또는 token이 필요합니다.");
        }

        const data = await prepareBooking({
          token: initial.tokenFromSession || undefined,
          roomId: hasQuery ? initial.roomId : undefined,
          checkinDate: hasQuery ? initial.checkinDate : undefined,
          checkoutDate: hasQuery ? initial.checkoutDate : undefined,
        });

        if (cancelled) return;

        setView(data);

        if (data?.token) {
          sessionStorage.setItem("reservationToken", data.token);
        }
      } catch (e) {
        if (cancelled) return;
        setError(e?.response?.data?.message || e?.message || "예약 정보 로딩 실패");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [initial]);

  const onChange = (key) => (e) => {
    setForm((prev) => ({
      ...prev,
      [key]: key === "guests" ? Number(e.target.value) : e.target.value,
    }));
  };

  /**
   * ✅ 이메일 인증코드 발송
   * - 성공 시 alert 띄움 (요구사항)
   * - cooldown 없음 (요구사항)
   * - 발송 중에는 다른 버튼 못 누름 (isLocked)
   * - 인증 완료 후에는 재발송/재인증 불가
   */
  const handleSendEmailCode = async () => {
    try {
      if (isLocked) return;
      if (emailAuth.verified) return; // ✅ 인증 완료면 발송 금지

      const email = (emailAuth.email || "").trim().replace(/[,，\s]+$/g, ""); // 끝 콤마/공백 제거

      if (!email) throw new Error("이메일을 입력해주세요.");
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) throw new Error("이메일 형식이 올바르지 않습니다.");

      setEmailAuth((prev) => ({
        ...prev,
        email, // 정리된 email 저장
        sending: true,
        error: "",
        message: "",
      }));

      await sendVerificationEmail(email);

      // ✅ 요구사항: 발송 시 alert
      alert("인증코드를 발송했습니다. 이메일을 확인해주세요.");

      setEmailAuth((prev) => ({
        ...prev,
        sending: false,
        sent: true,
        verified: false,
        message: "인증코드를 발송했어요.",
      }));
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "인증코드 발송 실패";
      setEmailAuth((prev) => ({
        ...prev,
        sending: false,
        error: msg,
        message: "",
      }));
    }
  };

  /**
   * ✅ 인증코드 확인
   * - 인증 완료 시 verified=true
   * - 인증 완료 후에는 다시 인증 버튼 눌러도 아무 일 없음 (안전장치)
   */
  const handleVerifyEmailCode = async () => {
    try {
      if (isLocked) return;
      if (emailAuth.verified) return; // ✅ 인증 완료면 재검증 불가

      const email = (emailAuth.email || "").trim().replace(/[,，\s]+$/g, "");
      const code = (emailAuth.code || "").trim();

      if (!email) throw new Error("이메일을 입력해주세요.");
      if (!code) throw new Error("인증번호를 입력해주세요.");

      setEmailAuth((prev) => ({
        ...prev,
        verifying: true,
        error: "",
        message: "",
      }));

      const res = await verifyEmailCode(email, code);
      const ok = !!res?.verified;

      if (!ok) {
        throw new Error("인증번호가 올바르지 않습니다.");
      }

      setEmailAuth((prev) => ({
        ...prev,
        verifying: false,
        verified: true,
        message: "이메일 인증이 완료되었습니다.",
        error: "",
      }));

      // ✅ 예약에 사용할 이메일 확정
      setForm((prev) => ({ ...prev, email }));
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "인증 실패";
      setEmailAuth((prev) => ({
        ...prev,
        verifying: false,
        error: msg,
        message: "",
      }));
    }
  };

  /**
   * ✅ 예약하기(저장)
   * - 누르는 순간 submitting=true로 잠금
   * - 처리 중 스피너 표시
   */
  const onSubmit = async () => {
    try {
      if (isLocked) return;

      setSubmitting(true);
      setError("");

      // 이메일 인증 완료 강제
      if (!emailAuth.verified) {
        throw new Error("이메일 인증을 완료해주세요.");
      }

      const token = sessionStorage.getItem("reservationToken");
      if (!token) throw new Error("예약 토큰이 없습니다. 다시 시도해주세요.");

      if (!form.userId) throw new Error("userId가 필요합니다.(임시)");

      const res = await createBookingFromToken({
        userId: Number(form.userId),
        token,
        guests: Number(form.guests || 2),
        bookerName: form.bookerName,
        visitMode: form.visitMode,
      });

      alert(`예약 완료!\n예약번호: ${res?.bookingNumber || "(없음)"}`);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "예약 생성 실패");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ 로딩 스피너 컴포넌트(가벼운 SVG)
  const Spinner = ({ className = "h-4 w-4" }) => (
    <svg
      className={`animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-label="loading"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <h1 className="text-xl font-semibold mb-2">예약 페이지 로딩 중</h1>
        <div className="text-sm text-gray-600">room / dailyRoomPolicy 정보를 불러오는 중입니다.</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-4 space-y-3">
        <h1 className="text-xl font-semibold">예약 페이지 오류</h1>
        <div className="rounded border p-3 text-sm">{error}</div>
        <button className="rounded border px-3 py-2" onClick={() => window.location.reload()} disabled={isLocked}>
          다시 시도
        </button>
      </div>
    );
  }

  if (!view) return null;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-semibold">예약</h1>

      {/* 1) 숙소/객실 정보 */}
      <section className="rounded border p-4">
        <div className="text-sm text-gray-500">숙소</div>
        <div className="text-lg font-semibold">{ui.accommodationName}</div>

        <div className="mt-1 text-sm text-gray-700">객실: {ui.roomName}</div>
        <div className="mt-1 text-sm text-gray-700">
          인원: 기준 {ui.standardCapacity} / 최대 {ui.maxCapacity}
        </div>
        <div className="mt-2 text-sm text-gray-700">
          일정: {String(ui.checkinDate)} ~ {String(ui.checkoutDate)}
        </div>
      </section>

      {/* 2) 일자별 가격/재고 */}
      <section className="rounded border p-4">
        <div className="text-lg font-semibold mb-3">일자별 가격/재고</div>

        <div className="space-y-2">
          {ui.policies?.map((p) => (
            <div key={p.policyId} className="flex items-center justify-between rounded bg-gray-50 p-2">
              <div className="text-sm">
                <div className="font-medium">{String(p.targetDate)}</div>
                <div className="text-gray-600">policyId: {p.policyId}</div>
              </div>
              <div className="text-right text-sm">
                <div className="font-semibold">{p.price?.toLocaleString()}원</div>
                <div className="text-gray-600">남은재고: {p.remainingStock}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 text-right text-lg font-semibold">
          총액: {Number(ui.totalPrice || 0).toLocaleString()}원
        </div>
      </section>

      {/* 3) 예약 정보 입력 */}
      <section className="rounded border p-4 space-y-3">
        <div className="text-lg font-semibold">예약 정보 입력</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* 이메일 + 발송 버튼 */}
          <div className="text-sm">
            이메일
            <div className="mt-1 flex gap-2">
              <input
                className="flex-1 rounded border px-3 py-2"
                placeholder="test@test.com"
                value={emailAuth.email}
                disabled={isLocked || emailAuth.verified}
                onChange={(e) =>
                  setEmailAuth((prev) => ({
                    ...prev,
                    email: e.target.value,
                    error: "",
                    message: "",
                  }))
                }
              />

              <button
                type="button"
                onClick={handleSendEmailCode}
                disabled={isLocked || emailAuth.verified}
                className={`
                  min-w-[120px] rounded border px-3 py-2 text-sm font-medium
                  ${
                    emailAuth.verified
                      ? "bg-green-50 text-green-700 border-green-300"
                      : isLocked
                      ? "bg-gray-100 text-gray-700 border-gray-300"
                      : "bg-white text-blue-700 border-blue-400 hover:bg-blue-50"
                  }
                  disabled:opacity-100
                `}
              >
                {emailAuth.verified ? (
                  "인증 완료"
                ) : emailAuth.sending ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner className="h-4 w-4" />
                    발송 중...
                  </span>
                ) : (
                  "인증코드 발송"
                )}
              </button>
            </div>
          </div>

          {/* 투숙 인원 */}
          <label className="text-sm">
            투숙 인원
            <input
              type="number"
              min={1}
              className="mt-1 w-full rounded border px-3 py-2"
              value={form.guests}
              onChange={onChange("guests")}
              disabled={isLocked}
            />
          </label>

          {/* 인증코드 입력/인증 버튼: 발송 이후 & 인증 전 */}
          {emailAuth.sent && !emailAuth.verified && (
            <div className="text-sm md:col-span-2">
              이메일 인증 코드
              <div className="mt-1 flex gap-2">
                <input
                  className="flex-1 rounded border px-3 py-2"
                  inputMode="numeric"
                  placeholder="숫자 6자리"
                  value={emailAuth.code}
                  disabled={isLocked}
                  onChange={(e) =>
                    setEmailAuth((prev) => ({
                      ...prev,
                      code: e.target.value,
                      error: "",
                      message: "",
                    }))
                  }
                />
                <button
                  type="button"
                  className="whitespace-nowrap rounded bg-black px-4 py-2 text-sm font-medium text-gray-900 disabled:opacity-50"
                  onClick={handleVerifyEmailCode}
                  disabled={isLocked || !emailAuth.code}
                >
                  {emailAuth.verifying ? (
                    <span className="inline-flex items-center gap-2">
                      <Spinner className="h-4 w-4" />
                      확인 중...
                    </span>
                  ) : (
                    "인증"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* 인증 완료 메시지 */}
          {emailAuth.verified && (
            <div className="text-sm md:col-span-2 text-green-600">
              ✔ 이메일 인증이 완료되었습니다.
            </div>
          )}

          {/* 메시지/에러 */}
          {(emailAuth.message || emailAuth.error) && (
            <div className={`text-sm md:col-span-2 ${emailAuth.error ? "text-red-600" : "text-gray-600"}`}>
              {emailAuth.error || emailAuth.message}
            </div>
          )}

          {/* 예약자 이름 */}
          <label className="text-sm">
            예약자 이름
            <input
              className="mt-1 w-full rounded border px-3 py-2"
              value={form.bookerName}
              onChange={onChange("bookerName")}
              placeholder="홍길동"
              disabled={isLocked}
            />
          </label>

          {/* 방문 방법 */}
          <div className="text-sm">
            방문 방법
            <div className="mt-2 grid grid-cols-2 gap-3">
              <label className="flex items-center justify-center gap-2 h-10 rounded cursor-pointer transition">
                <input
                  type="radio"
                  name="visitMode"
                  value="WALK"
                  checked={form.visitMode === "WALK"}
                  onChange={onChange("visitMode")}
                  className="w-5 h-5"
                  disabled={isLocked}
                />
                <span className="text-sm font-medium">도보</span>
              </label>

              <label className="flex items-center justify-center gap-2 h-10 rounded cursor-pointer transition">
                <input
                  type="radio"
                  name="visitMode"
                  value="CAR"
                  checked={form.visitMode === "CAR"}
                  onChange={onChange("visitMode")}
                  className="w-5 h-5"
                  disabled={isLocked}
                />
                <span className="text-sm font-medium">차량</span>
              </label>
            </div>
          </div>
        </div>

        {/* 예약하기 */}
        <button
          className="w-full rounded bg-black text-white py-3 font-semibold disabled:opacity-50"
          onClick={onSubmit}
          disabled={isLocked || !emailAuth.verified}
        >
          {submitting ? (
            <span className="inline-flex items-center justify-center gap-2">
              <Spinner className="h-5 w-5" />
              저장 중...
            </span>
          ) : (
            "예약하기"
          )}
        </button>

        {error ? <div className="text-sm text-red-600">{error}</div> : null}
      </section>
    </div>
  );
}
