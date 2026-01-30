// // src/pages/itinerary/ItineraryPage.jsx (경로는 네 프로젝트에 맞게)

// import { Routes, Route, useNavigate, useSearchParams } from "react-router-dom";
// import ItineraryList from "./ItineraryList";

// export default function ItineraryPage() {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();

//   // 로그인 붙기 전까지는 ?userId=1 이런 식으로 받거나, 기본 1로
//   const userId = searchParams.get("userId") || 1;

//   return (
//     <div className="container mx-auto p-4 md:p-8">
//       {/* 상단 헤더 영역 */}
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold text-gray-800">내 일정</h1>

//         {/* 일정 없으면 → 숙소부터 예약하러 가기 */}
//         <button
//           className="btn-primary"
//           onClick={() => navigate("/?focus=search")}
//         >
//           숙소 예약하러 가기
//         </button>
//       </div>

//       {/* 흰 카드 안에 실제 '내 일정(=예약)' 목록 렌더링 */}
//       <div className="bg-white shadow-md rounded-lg p-6">
//         <Routes>
//           {/* 내 일정 = 내 예약들로 구성된 화면 */}
//           <Route index element={<ItineraryList userId={userId} />} />
//         </Routes>
//       </div>
//     </div>
//   );
// }
