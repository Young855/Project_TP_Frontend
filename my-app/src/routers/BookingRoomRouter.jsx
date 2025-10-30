// src/routers/BookingRoomRouter.jsx
import React from "react";
import {
  Outlet,
  Link,
  useLoaderData,
  useActionData,
  Form,
  redirect,
  useParams,
} from "react-router-dom";

// ✅ 제공한 래퍼를 사용합니다. 경로는 프로젝트에 맞춰 조정하세요.
import {
  getAllBookingRooms,
  getBookingRoom,
  createBookingRoom,
  updateBookingRoom,
  deleteBookingRoom,
} from "../api/bookingRoomAPI"; // <- 경로 확인 필요

/* =========================
   인증/인가 유틸 (프로젝트 규칙에 맞게 수정)
   ========================= */
function getAuth() {
  try {
    const raw = localStorage.getItem("auth"); // { token, role }
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function assertAdminOrRedirect(request) {
  const auth = getAuth();
  const url = new URL(request.url);
  if (!auth) {
    const to = "/login?next=" + encodeURIComponent(url.pathname + url.search);
    throw redirect(to);
  }
  if (auth.role !== "ADMIN") {
    throw redirect("/forbidden");
  }
}

/* =========================
   로더 (데이터 선패칭)
   ========================= */
// 목록 로더: 현재 API는 전체 조회이므로 페이징 없이 표시
export async function bookingRoomsListLoader() {
  const data = await getAllBookingRooms();
  return { list: Array.isArray(data) ? data : data?.content ?? [] };
}

// 상세 로더: /booking-rooms/:bookingId/:roomId
export async function bookingRoomDetailLoader({ params }) {
  const bookingId = Number(params.bookingId);
  const roomId = Number(params.roomId);
  const item = await getBookingRoom(bookingId, roomId);
  return { item };
}

/* =========================
   액션 (폼 제출 & 삭제)
   ========================= */
// 생성
export async function bookingRoomCreateAction({ request }) {
  assertAdminOrRedirect(request);
  const fd = await request.formData();
  const payload = {
    bookingId: Number(fd.get("bookingId")),
    roomId: Number(fd.get("roomId")),
    qty: Number(fd.get("qty")),
    pricePerNight: Number(fd.get("pricePerNight")),
    nights: Number(fd.get("nights")),
  };

  try {
    await createBookingRoom(payload);
    return redirect(`/booking-rooms/${payload.bookingId}/${payload.roomId}`);
  } catch (err) {
    return { error: parseApiError(err), values: payload };
  }
}

// 수정
export async function bookingRoomUpdateAction({ request, params }) {
  assertAdminOrRedirect(request);
  const fd = await request.formData();
  const bookingId = Number(params.bookingId);
  const roomId = Number(params.roomId);
  const payload = {
    bookingId,
    roomId,
    qty: Number(fd.get("qty")),
    pricePerNight: Number(fd.get("pricePerNight")),
    nights: Number(fd.get("nights")),
  };

  try {
    await updateBookingRoom(bookingId, roomId, payload);
    return redirect(`/booking-rooms/${bookingId}/${roomId}`);
  } catch (err) {
    return { error: parseApiError(err), values: payload };
  }
}

// 삭제
export async function bookingRoomDeleteAction({ request, params }) {
  assertAdminOrRedirect(request);
  const bookingId = Number(params.bookingId);
  const roomId = Number(params.roomId);
  try {
    await deleteBookingRoom(bookingId, roomId);
    return redirect(`/booking-rooms`);
  } catch (err) {
    return { error: parseApiError(err) };
  }
}

/* =========================
   페이지 컴포넌트 (최소 UI)
   ========================= */

function BookingRoomsLayout() {
  return (
    <div className="container mx-auto p-4">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Booking – Rooms</h1>
        <Link className="underline" to="/booking-rooms">목록</Link>
      </header>
      <Outlet />
    </div>
  );
}

function calcTotal(qty, pricePerNight, nights) {
  const q = Number(qty) || 0;
  const p = Number(pricePerNight) || 0;
  const n = Number(nights) || 0;
  return q * p * n;
}

function BookingRoomsListPage() {
  const { list } = useLoaderData(); // [{ bookingId, roomId, qty, pricePerNight, nights, ... }]

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link to="/booking-rooms/new" className="border px-3 py-2 rounded">새로 만들기</Link>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-50">
            <th className="border p-2 text-left">Booking ID</th>
            <th className="border p-2 text-left">Room ID</th>
            <th className="border p-2 text-left">Qty</th>
            <th className="border p-2 text-left">Price/Night</th>
            <th className="border p-2 text-left">Nights</th>
            <th className="border p-2 text-left">Total</th>
            <th className="border p-2 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {list.map((x) => (
            <tr key={`${x.bookingId}-${x.roomId}`}>
              <td className="border p-2">{x.bookingId ?? x.booking?.bookingId ?? "-"}</td>
              <td className="border p-2">{x.roomId ?? x.room?.roomId ?? "-"}</td>
              <td className="border p-2">{x.qty}</td>
              <td className="border p-2">{x.pricePerNight}</td>
              <td className="border p-2">{x.nights}</td>
              <td className="border p-2">{calcTotal(x.qty, x.pricePerNight, x.nights)}</td>
              <td className="border p-2">
                <Link
                  className="underline"
                  to={`/booking-rooms/${x.bookingId ?? x.booking?.bookingId}/${x.roomId ?? x.room?.roomId}`}
                >
                  보기
                </Link>
              </td>
            </tr>
          ))}
          {list.length === 0 && (
            <tr><td className="p-4 text-center" colSpan={7}>데이터 없음</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function BookingRoomDetailPage() {
  const { item } = useLoaderData(); // { bookingId, roomId, qty, pricePerNight, nights } 또는 연관객체 포함
  const bookingId = item.bookingId ?? item.booking?.bookingId;
  const roomId = item.roomId ?? item.room?.roomId;

  return (
    <div className="space-y-4">
      <div className="border p-4 rounded">
        <div><b>Booking ID:</b> {bookingId}</div>
        <div><b>Room ID:</b> {roomId}</div>
        <div><b>Qty:</b> {item.qty}</div>
        <div><b>Price/Night:</b> {item.pricePerNight}</div>
        <div><b>Nights:</b> {item.nights}</div>
        <div><b>Total:</b> {calcTotal(item.qty, item.pricePerNight, item.nights)}</div>
      </div>

      <div className="flex gap-2">
        <Link className="border px-3 py-2 rounded" to="edit">수정</Link>
        <Form method="post" action="delete" onSubmit={(e)=>{ if(!confirm("정말 삭제할까요?")) e.preventDefault(); }}>
          <button className="border px-3 py-2 rounded" type="submit">삭제</button>
        </Form>
        <Link className="underline px-3 py-2" to="/booking-rooms">목록으로</Link>
      </div>
    </div>
  );
}

function BookingRoomForm({ mode }) {
  const actionData = useActionData(); // { error, values }
  const err = actionData?.error;
  const vals = actionData?.values ?? {};
  const params = useParams();

  const isEdit = mode === "edit";
  const bookingId = isEdit ? Number(params.bookingId) : (vals.bookingId ?? "");
  const roomId = isEdit ? Number(params.roomId) : (vals.roomId ?? "");

  return (
    <div className="space-y-4">
      {err && (
        <div className="border border-red-400 text-red-700 p-3 rounded">
          <div className="font-semibold">에러</div>
          <div className="text-sm whitespace-pre-wrap">{err.message}</div>
          {err.code && <div className="text-xs mt-1 opacity-70">code: {err.code}</div>}
        </div>
      )}

      <Form method="post" className="space-y-3" replace>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <label className="text-sm">Booking ID<span className="text-red-500">*</span></label>
            <input
              name="bookingId"
              type="number"
              required
              defaultValue={bookingId}
              disabled={isEdit}
              className="border p-2 rounded"
              placeholder="예: 101"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm">Room ID<span className="text-red-500">*</span></label>
            <input
              name="roomId"
              type="number"
              required
              defaultValue={roomId}
              disabled={isEdit}
              className="border p-2 rounded"
              placeholder="예: 305"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm">Qty<span className="text-red-500">*</span></label>
            <input
              name="qty"
              type="number"
              min={1}
              required
              defaultValue={vals.qty ?? 1}
              className="border p-2 rounded"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm">Price/Night<span className="text-red-500">*</span></label>
            <input
              name="pricePerNight"
              type="number"
              min={0}
              required
              defaultValue={vals.pricePerNight ?? 0}
              className="border p-2 rounded"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm">Nights<span className="text-red-500">*</span></label>
            <input
              name="nights"
              type="number"
              min={1}
              required
              defaultValue={vals.nights ?? 1}
              className="border p-2 rounded"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button className="border px-3 py-2 rounded" type="submit">
            {isEdit ? "수정 저장" : "생성"}
          </button>
          <Link className="underline px-3 py-2" to="/booking-rooms">취소</Link>
        </div>
      </Form>
    </div>
  );
}

function BookingRoomCreatePage() {
  return <BookingRoomForm mode="create" />;
}

function BookingRoomEditPage() {
  return <BookingRoomForm mode="edit" />;
}

function RouteErrorFallback() {
  return (
    <div className="p-4 border border-red-300 rounded bg-red-50">
      <div className="font-semibold">문제가 발생했습니다.</div>
      <div className="text-sm mt-1">잠시 후 다시 시도하거나, 목록으로 돌아가세요.</div>
      <Link className="underline" to="/booking-rooms">목록으로</Link>
    </div>
  );
}

/* =========================
   라우트 정의 (export)
   ========================= */
export const bookingRoomRoutes = [
  {
    path: "/booking-rooms",
    element: <BookingRoomsLayout />,
    errorElement: <RouteErrorFallback />,
    children: [
      {
        index: true,
        loader: bookingRoomsListLoader,
        element: <BookingRoomsListPage />,
      },
      {
        path: "new",
        element: <BookingRoomCreatePage />,
        action: bookingRoomCreateAction,
        errorElement: <RouteErrorFallback />,
      },
      {
        path: ":bookingId/:roomId",
        loader: bookingRoomDetailLoader,
        element: <BookingRoomDetailPage />,
        errorElement: <RouteErrorFallback />,
      },
      {
        path: ":bookingId/:roomId/edit",
        element: <BookingRoomEditPage />,
        action: bookingRoomUpdateAction,
        errorElement: <RouteErrorFallback />,
      },
      {
        path: ":bookingId/:roomId/delete",
        action: bookingRoomDeleteAction,
        errorElement: <RouteErrorFallback />,
      },
    ],
  },
];

/* =========================
   에러 파서 (서버 공통 에러 포맷 흡수)
   ========================= */
function parseApiError(err) {
  if (!err) return { message: "Unknown error" };
  if (err.response && err.response.data) {
    const d = err.response.data;
    return {
      status: d.status ?? err.response.status,
      code: d.code ?? d.error ?? "API_ERROR",
      message: d.message ?? JSON.stringify(d),
    };
  }
  return { code: "NETWORK_ERROR", message: err.message || "Network error" };
}

/* =========================
   루트 라우터 통합 예시
   createBrowserRouter([
     ...bookingRoomRoutes,
     // ...amenityRoutes, ...userRoutes 등
   ])
   ========================= */
