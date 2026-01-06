// // src/pages/itinerary/ItineraryList.jsx

// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { getAllBookings } from "../../api/bookingAPI";

// export default function ItineraryList({ userId }) {
//   const [items, setItems] = useState([]);   // 예약 목록 = 내 일정
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState("");

//   const load = async () => {
//     setErr("");
//     setLoading(true);
//     try {
//       // 내 예약만 가져오도록 userId 기준 + 체크인날짜 오름차순
//       const params = {
//         userId: Number(userId),
//         sort: "checkIn,asc",
//       };

//       const res = await getAllBookings(params);
//       const list = res?.content ?? res ?? [];
//       setItems(list);
//     } catch (e) {
//       console.error(e);
//       setErr(e.response?.data?.message || e.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     load();
//     // userId 바뀌면 다시 로드
//   }, [userId]);

//   // 오늘 기준으로 다가오는 / 지난 일정 나누기
//   const todayStr = new Date().toISOString().slice(0, 10);

//   const parseDate = (v) => {
//     if (!v) return null;
//     // checkIn / checkInDate / checkinDate 중 있는 거 사용
//     return new Date(v);
//   };

//   const upcoming = [];
//   const past = [];

//   items.forEach((b) => {
//     const checkOutRaw =
//       b.checkOut ?? b.checkOutDate ?? b.checkoutDate ?? b.checkOutUtc;
//     const d = checkOutRaw ? new Date(checkOutRaw) : null;

//     if (d && d.toISOString().slice(0, 10) < todayStr) {
//       past.push(b);
//     } else {
//       upcoming.push(b);
//     }
//   });

//   if (loading) return <div>일정을 불러오는 중...</div>;

//   if (err) {
//     // 여기서 예전처럼 "전체 목록 확인 불가" 떠도 화면에만 띄우고 끝
//     return <div style={{ color: "red" }}>{err}</div>;
//   }

//   if (!loading && items.length === 0) {
//     return <div>아직 예약된 일정이 없습니다.</div>;
//   }

//   const renderCard = (b) => {
//     const checkIn =
//       b.checkIn ?? b.checkInDate ?? b.checkinDate ?? b.checkInUtc ?? "";
//     const checkOut =
//       b.checkOut ?? b.checkOutDate ?? b.checkoutDate ?? b.checkOutUtc ?? "";
//     const title = b.propertyName ?? `숙소 #${b.propertyId}`;

//     return (
//       <div
//         key={b.id}
//         style={{
//           border: "1px solid #e5e7eb",
//           borderRadius: 12,
//           padding: 16,
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           backgroundColor: "#f9fafb",
//         }}
//       >
//         <div>
//           {/* 숙소 이름 */}
//           <div
//             style={{
//               fontWeight: 700,
//               marginBottom: 4,
//               fontSize: 16,
//             }}
//           >
//             {title}
//           </div>

//           {/* 날짜 */}
//           <div style={{ fontSize: 14, color: "#4b5563" }}>
//             {checkIn} ~ {checkOut}
//           </div>

//           {/* 상태 */}
//           <div
//             style={{
//               fontSize: 13,
//               color: "#6b7280",
//               marginTop: 4,
//             }}
//           >
//             상태: {b.status}
//           </div>
//         </div>

//         {/* 예약 상세로 이동 */}
//         <div style={{ display: "flex", gap: 8 }}>
//           <Link
//             to={`/bookings/${b.id}`}
//             style={{
//               padding: "6px 12px",
//               borderRadius: 8,
//               border: "1px solid #e5e7eb",
//               backgroundColor: "#ffffff",
//               fontSize: 14,
//               textDecoration: "none",
//             }}
//           >
//             예약 상세
//           </Link>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div style={{ maxWidth: 980, margin: "0 auto" }}>
//       {/* 다가오는 일정 */}
//       {upcoming.length > 0 && (
//         <section style={{ marginBottom: 32 }}>
//           <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
//             다가오는 일정
//           </h2>
//           <div style={{ display: "grid", gap: 12 }}>
//             {upcoming.map(renderCard)}
//           </div>
//         </section>
//       )}

//       {/* 지난 일정 */}
//       {past.length > 0 && (
//         <section>
//           <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
//             지난 일정
//           </h2>
//           <div style={{ display: "grid", gap: 12 }}>
//             {past.map(renderCard)}
//           </div>
//         </section>
//       )}
//     </div>
//   );
// }
