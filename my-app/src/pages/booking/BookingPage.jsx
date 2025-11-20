import { Routes, Route, useNavigate, useSearchParams } from "react-router-dom";
import BookingList from "./BookingList";
import BookingCreate from "./BookingCreate";
import BookingDetail from "./BookingDetail";

export default function BookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // URL ?userId=3 이런 식으로 들어오면 그걸 쓰고, 없으면 1로 가정
  const userId = searchParams.get("userId") || 1;

  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* 🔹 PartnerPropertiesPage 의 헤더처럼 위로 뺀 영역 */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">예약 내역</h1>

        <button
          className="btn-primary"
          onClick={() => navigate(`/bookings/new?userId=${userId}`)}
        >
          예약하기
        </button>
      </div>

      {/* 🔹 아래는 흰 카드 안에 리스트/생성/상세 라우트가 들어가는 영역 */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <Routes>
          {/* 기본: 내 예약 내역(목록) */}
          <Route index element={<BookingList userId={userId} />} />
          {/* 예약하기 화면 */}
          <Route path="new" element={<BookingCreate />} />
          {/* 예약 상세 */}
          <Route path=":id" element={<BookingDetail userId={userId} />} />
        </Routes>
      </div>
    </div>
  );
}
