import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createBooking } from "../../api/bookingAPI";

export default function BookingCreate() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();

  // /bookings/new?userId=1 이런 식으로 들어온다고 가정
  const userIdFromQuery = searchParams.get("userId") || "";

  const [form, setForm] = useState({
    userId: userIdFromQuery, // URL에서 받은 값
    propertyId: "",
    roomId: "",
    checkIn: "",
    checkOut: "",
    guests: 2,
    note: "",
  });

  const [saving, setSaving] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 박 수 / 대충 금액 계산 (나중에 진짜 요금 계산 로직으로 교체)
  const getNights = () => {
    if (!form.checkIn || !form.checkOut) return 0;
    const inDate = new Date(form.checkIn);
    const outDate = new Date(form.checkOut);
    const diffMs = outDate.getTime() - inDate.getTime();
    const nights = diffMs / (1000 * 60 * 60 * 24);
    return nights > 0 ? nights : 0;
  };

  const nights = getNights();
  const dummyNightlyRate = 50000; // 임시 1박 요금 (원)
  const estimatedTotal = nights * dummyNightlyRate;

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.userId) {
      alert("userId가 없다. URL에 ?userId= 값을 넣으시오.");
      return;
    }

    if (!form.checkIn || !form.checkOut) {
      alert("체크인/체크아웃 날짜를 모두 선택해 주세요.");
      return;
    }

    if (new Date(form.checkIn) >= new Date(form.checkOut)) {
      alert("체크아웃 날짜는 체크인 날짜 이후여야 합니다.");
      return;
    }

    if (!form.guests || Number(form.guests) <= 0) {
      alert("투숙 인원을 1명 이상으로 입력해 주세요.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        userId: Number(form.userId),
        propertyId: form.propertyId ? Number(form.propertyId) : undefined,
        roomId: form.roomId ? Number(form.roomId) : undefined,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        guests: Number(form.guests),
        note: form.note,
      };

      const res = await createBooking(payload);
      const id = res?.id;

      alert("예약이 완료 되었습니다.");

      // /bookings 페이지 라우터에 맞춰 이동
      if (id) {
        nav(`/bookings/${id}?userId=${form.userId}`);
      } else {
        nav(`/bookings?userId=${form.userId}`);
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "예약 오류");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* userId는 숨겨둠 */}
      <input type="hidden" name="userId" value={form.userId} />

      {/* 제목 + 설명 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">예약하기</h2>
        <p className="text-sm text-gray-500">
          체크인·체크아웃 날짜와 인원을 확인하고 예약을 완료해 주세요.
        </p>
      </div>

      {/* 숙소/객실 요약 (여기어때 상단 정보 박스 느낌) */}
      <section className="p-4 border rounded-lg bg-gray-50 space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">숙소 정보</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="text-sm text-gray-700">
           숙소 이름
            <input
              type="text"
              name="propertyId"
              className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
              placeholder=""
              value={form.propertyId}
              onChange={onChange}
            />
          </label>
          <label className="text-sm text-gray-700">
            호수
            <input
              type="number"
              name="roomId"
              className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
              placeholder="예: 1 (나중엔 자동으로 채워질 예정)"
              value={form.roomId}
              onChange={onChange}
            />
          </label>
        </div>

      </section>

      {/* 이용 정보 (체크인/아웃, 인원) */}
      <section className="p-4 border rounded-lg space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">이용 정보</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="text-sm text-gray-700">
            체크인
            <input
              type="date"
              name="checkIn"
              className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
              value={form.checkIn}
              onChange={onChange}
            />
          </label>

          <label className="text-sm text-gray-700">
            체크아웃
            <input
              type="date"
              name="checkOut"
              className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
              value={form.checkOut}
              onChange={onChange}
            />
          </label>

          <label className="text-sm text-gray-700">
            인원
            <input
              type="number"
              min={1}
              name="guests"
              className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
              value={form.guests}
              onChange={onChange}
            />
          </label>
        </div>

        <p className="text-xs text-gray-400">
          날짜와 인원은 숙소 상세 페이지에서 선택한 값으로 자동 세팅되도록
          나중에 연동하면 됩니다.
        </p>
      </section>

      {/* 요청 사항 (여기어때 요청사항 란 느낌) */}
      <section className="p-4 border rounded-lg space-y-2">
        <h3 className="text-lg font-semibold text-gray-800">요청 사항</h3>
        <textarea
          name="note"
          rows={3}
          className="w-full border rounded-md px-3 py-2 text-sm"
          placeholder="예: 새벽 1시쯤 도착 예정입니다. 조용한 방으로 부탁드려요."
          value={form.note}
          onChange={onChange}
        />
        <p className="text-xs text-gray-400">
          호텔에 전달될 메모입니다. (도착 시간, 침구 요청, 기타 특이사항 등)
        </p>
      </section>

      {/* 금액 요약 (여기어때 오른쪽 요약 박스 느낌) */}
      <section className="p-4 border rounded-lg bg-gray-50 space-y-2">
        <h3 className="text-lg font-semibold text-gray-800">결제 금액</h3>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            숙박 {nights > 0 ? `${nights}박` : "-"}
          </span>
          <span className="font-medium text-gray-800">
            {nights > 0 ? `${estimatedTotal.toLocaleString()}원 (예상)` : "-"}
          </span>
        </div>
        <p className="text-xs text-gray-400">
          현재는 예시 금액입니다. 실제 서비스에서는 객실 요금, 기간, 쿠폰 등을
          반영하여 자동 계산되도록 수정해야 합니다.
        </p>
      </section>

      {/* 버튼 영역 */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          className="px-4 py-2 rounded-md border text-sm"
          onClick={() => window.history.back()}
        >
          취소
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-md bg-red-500 text-white text-sm font-semibold disabled:opacity-60"
        >
          {saving ? "예약 처리 중..." : "예약 확정하기"}
        </button>
      </div>
    </form>
  );
}
