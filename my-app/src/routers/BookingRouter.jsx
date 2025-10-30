// src/routers/BookingRouter.jsx
import React from "react";
import {
  Outlet,
  Link,
  useLoaderData,
  useActionData,
  useParams,
  Form,
  redirect,
} from "react-router-dom";

// ✅ 제공한 래퍼 함수들 사용 (경로는 프로젝트에 맞게 조정)
// 예: src/api/bookingApi.js 로 저장되어 있다면 아래 import 경로 확인
import {
  getAllBookings,
  getBooking,
  getBookingsByUserId,
  createBooking,
  updateBooking,
  deleteBooking,
} from "../api/bookingAPI";

/* =========================
   인증 유틸 (프로젝트 정책에 맞게 수정 가능)
   ========================= */
function getAuth() {
  try {
    const raw = localStorage.getItem("auth"); // { token, role, userId, ... }
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function assertLoggedInOrRedirect(request) {
  const auth = getAuth();
  if (!auth) {
    const url = new URL(request.url);
    const to = "/login?next=" + encodeURIComponent(url.pathname + url.search);
    throw redirect(to);
  }
}

/* =========================
   Enum 후보 (프론트 검증용)
   ========================= */
const BOOKING_STATUS = ["PENDING", "CONFIRMED", "CANCELLED"];
const PAYMENT_STATUS = ["UNPAID", "PAID", "REFUNDED"];

/* =========================
   로더 (데이터 선패칭)
   ========================= */
// 목록
export async function bookingsListLoader() {
  const data = await getAllBookings();
  // 백엔드가 Page<>면 .content 고려, 지금은 단순 배열 가정
  const list = Array.isArray(data) ? data : data?.content ?? [];
  return { list };
}

// 상세
export async function bookingDetailLoader({ params }) {
  const id = Number(params.id);
  const item = await getBooking(id);
  return { item };
}

// 사용자별 목록 (선택 라우트)
export async function bookingsByUserLoader({ params }) {
  const userId = Number(params.userId);
  const data = await getBookingsByUserId(userId);
  const list = Array.isArray(data) ? data : data?.content ?? [];
  return { userId, list };
}

/* =========================
   액션 (생성/수정/삭제)
   ========================= */
function parseFormToPayload(fd, opts = {}) {
  // 날짜 문자열 그대로 전달 (YYYY-MM-DD)
  const payload = {
    userId: Number(fd.get("userId")),
    status: String(fd.get("status") || "").toUpperCase(),
    paymentStatus: String(fd.get("paymentStatus") || "").toUpperCase(),
    checkinDate: String(fd.get("checkinDate") || ""),
    checkoutDate: String(fd.get("checkoutDate") || ""),
    guests: Number(fd.get("guests")),
    totalAmount: Number(fd.get("totalAmount")),
  };

  // 간단한 프론트 검증 (백엔드 검증이 최종 권위)
  if (!payload.userId || Number.isNaN(payload.userId)) {
    throw { validation: true, message: "userId는 필수입니다." };
  }
  if (!BOOKING_STATUS.includes(payload.status)) {
    throw { validation: true, message: "status 값이 올바르지 않습니다." };
  }
  if (!PAYMENT_STATUS.includes(payload.paymentStatus)) {
    throw { validation: true, message: "paymentStatus 값이 올바르지 않습니다." };
  }
  if (!payload.checkinDate || !payload.checkoutDate) {
    throw { validation: true, message: "체크인/체크아웃 날짜는 필수입니다." };
  }
  if (new Date(payload.checkoutDate) <= new Date(payload.checkinDate)) {
    throw { validation: true, message: "체크아웃 날짜는 체크인보다 뒤여야 합니다." };
  }
  if (!(payload.guests > 0)) {
    throw { validation: true, message: "guests는 1 이상이어야 합니다." };
  }
  if (!(payload.totalAmount >= 0)) {
    throw { validation: true, message: "totalAmount는 0 이상이어야 합니다." };
  }
  return payload;
}

// 생성
export async function bookingCreateAction({ request }) {
  assertLoggedInOrRedirect(request);
  const fd = await request.formData();
  try {
    const payload = parseFormToPayload(fd);
    const created = await createBooking(payload);
    const id = created?.bookingId ?? created?.id;
    return redirect(`/bookings/${id}`);
  } catch (err) {
    if (err?.validation) {
      return { error: { code: "VALIDATION", message: err.message }, values: Object.fromEntries(fd) };
    }
    return { error: parseApiError(err), values: Object.fromEntries(fd) };
  }
}

// 수정
export async function bookingUpdateAction({ request, params }) {
  assertLoggedInOrRedirect(request);
  const id = Number(params.id);
  const fd = await request.formData();
  try {
    const payload = parseFormToPayload(fd);
    await updateBooking(id, payload);
    return redirect(`/bookings/${id}`);
  } catch (err) {
    if (err?.validation) {
      return { error: { code: "VALIDATION", message: err.message }, values: { id, ...Object.fromEntries(fd) } };
    }
    return { error: parseApiError(err), values: { id, ...Object.fromEntries(fd) } };
  }
}

// 삭제
export async function bookingDeleteAction({ request, params }) {
  assertLoggedInOrRedirect(request);
  const id = Number(params.id);
  try {
    await deleteBooking(id);
    return redirect(`/bookings`);
  } catch (err) {
    return { error: parseApiError(err) };
  }
}

/* =========================
   최소 UI 컴포넌트
   ========================= */
function BookingsLayout() {
  return (
    <div className="container mx-auto p-4">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Bookings</h1>
        <Link className="underline" to="/bookings">목록</Link>
      </header>
      <Outlet />
    </div>
  );
}

function BookingsListPage() {
  const { list } = useLoaderData(); // 배열
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link to="/bookings/new" className="border px-3 py-2 rounded">새로 만들기</Link>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-50">
            <th className="border p-2 text-left">ID</th>
            <th className="border p-2 text-left">User</th>
            <th className="border p-2 text-left">Status</th>
            <th className="border p-2 text-left">Payment</th>
            <th className="border p-2 text-left">Check-in</th>
            <th className="border p-2 text-left">Check-out</th>
            <th className="border p-2 text-left">Guests</th>
            <th className="border p-2 text-left">Total</th>
            <th className="border p-2 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {list.map((b) => (
            <tr key={b.bookingId ?? b.id}>
              <td className="border p-2">{b.bookingId ?? b.id}</td>
              <td className="border p-2">{b.userId ?? b.user?.userId ?? "-"}</td>
              <td className="border p-2">{b.status}</td>
              <td className="border p-2">{b.paymentStatus}</td>
              <td className="border p-2">{b.checkinDate}</td>
              <td className="border p-2">{b.checkoutDate}</td>
              <td className="border p-2">{b.guests}</td>
              <td className="border p-2">{b.totalAmount}</td>
              <td className="border p-2">
                <Link className="underline" to={`/bookings/${b.bookingId ?? b.id}`}>보기</Link>
              </td>
            </tr>
          ))}
          {list.length === 0 && (
            <tr><td className="p-4 text-center" colSpan={9}>데이터 없음</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function BookingDetailPage() {
  const { item } = useLoaderData();
  const id = item.bookingId ?? item.id;
  const userId = item.userId ?? item.user?.userId;

  return (
    <div className="space-y-4">
      <div className="border p-4 rounded">
        <div><b>ID:</b> {id}</div>
        <div><b>User:</b> {userId}</div>
        <div><b>Status:</b> {item.status}</div>
        <div><b>Payment:</b> {item.paymentStatus}</div>
        <div><b>Check-in:</b> {item.checkinDate}</div>
        <div><b>Check-out:</b> {item.checkoutDate}</div>
        <div><b>Guests:</b> {item.guests}</div>
        <div><b>Total:</b> {item.totalAmount}</div>
      </div>
      <div className="flex gap-2">
        <Link className="border px-3 py-2 rounded" to="edit">수정</Link>
        <Form method="post" action="delete" onSubmit={(e)=>{ if(!confirm("정말 삭제할까요?")) e.preventDefault(); }}>
          <button className="border px-3 py-2 rounded" type="submit">삭제</button>
        </Form>
        <Link className="underline px-3 py-2" to="/bookings">목록으로</Link>
      </div>
    </div>
  );
}

function BookingForm({ mode }) {
  const actionData = useActionData(); // { error, values }
  const { id: paramId } = useParams();
  const isEdit = mode === "edit";

  const vals = actionData?.values ?? {};
  const id = isEdit ? Number(paramId) : undefined;

  return (
    <div className="space-y-4">
      {actionData?.error && (
        <div className="border border-red-400 text-red-700 p-3 rounded">
          <div className="font-semibold">에러</div>
          <div className="text-sm whitespace-pre-wrap">{actionData.error.message}</div>
          {actionData.error.code && <div className="text-xs mt-1 opacity-70">code: {actionData.error.code}</div>}
        </div>
      )}

      <Form method="post" className="space-y-3" replace>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <label className="text-sm">User ID<span className="text-red-500">*</span></label>
            <input
              name="userId"
              type="number"
              required
              defaultValue={vals.userId ?? ""}
              className="border p-2 rounded"
              placeholder="예: 1001"
              disabled={false /* 필요 시 자동 사용자 채우기 */}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm">Status<span className="text-red-500">*</span></label>
            <select name="status" className="border p-2 rounded" defaultValue={vals.status ?? "PENDING"} required>
              {BOOKING_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm">Payment Status<span className="text-red-500">*</span></label>
            <select name="paymentStatus" className="border p-2 rounded" defaultValue={vals.paymentStatus ?? "UNPAID"} required>
              {PAYMENT_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm">Check-in<span className="text-red-500">*</span></label>
            <input name="checkinDate" type="date" required defaultValue={vals.checkinDate ?? ""} className="border p-2 rounded" />
          </div>

          <div className="flex flex-col">
            <label className="text-sm">Check-out<span className="text-red-500">*</span></label>
            <input name="checkoutDate" type="date" required defaultValue={vals.checkoutDate ?? ""} className="border p-2 rounded" />
          </div>

          <div className="flex flex-col">
            <label className="text-sm">Guests<span className="text-red-500">*</span></label>
            <input name="guests" type="number" min={1} required defaultValue={vals.guests ?? 1} className="border p-2 rounded" />
          </div>

          <div className="flex flex-col">
            <label className="text-sm">Total Amount<span className="text-red-500">*</span></label>
            <input name="totalAmount" type="number" min={0} required defaultValue={vals.totalAmount ?? 0} className="border p-2 rounded" />
          </div>
        </div>

        <div className="flex gap-2">
          <button className="border px-3 py-2 rounded" type="submit">
            {isEdit ? "수정 저장" : "생성"}
          </button>
          <Link className="underline px-3 py-2" to="/bookings">취소</Link>
        </div>
      </Form>
    </div>
  );
}

function BookingCreatePage() {
  return <BookingForm mode="create" />;
}

function BookingEditPage() {
  return <BookingForm mode="edit" />;
}

function BookingsByUserPage() {
  const { userId, list } = useLoaderData();
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">User #{userId} 의 예약</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-50">
            <th className="border p-2 text-left">ID</th>
            <th className="border p-2 text-left">Status</th>
            <th className="border p-2 text-left">Payment</th>
            <th className="border p-2 text-left">Check-in</th>
            <th className="border p-2 text-left">Check-out</th>
            <th className="border p-2 text-left">Guests</th>
            <th className="border p-2 text-left">Total</th>
            <th className="border p-2 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {list.map((b) => (
            <tr key={b.bookingId ?? b.id}>
              <td className="border p-2">{b.bookingId ?? b.id}</td>
              <td className="border p-2">{b.status}</td>
              <td className="border p-2">{b.paymentStatus}</td>
              <td className="border p-2">{b.checkinDate}</td>
              <td className="border p-2">{b.checkoutDate}</td>
              <td className="border p-2">{b.guests}</td>
              <td className="border p-2">{b.totalAmount}</td>
              <td className="border p-2">
                <Link className="underline" to={`/bookings/${b.bookingId ?? b.id}`}>보기</Link>
              </td>
            </tr>
          ))}
          {list.length === 0 && (
            <tr><td className="p-4 text-center" colSpan={8}>데이터 없음</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function RouteErrorFallback() {
  return (
    <div className="p-4 border border-red-300 rounded bg-red-50">
      <div className="font-semibold">문제가 발생했습니다.</div>
      <div className="text-sm mt-1">잠시 후 다시 시도하거나, 목록으로 돌아가세요.</div>
      <Link className="underline" to="/bookings">목록으로</Link>
    </div>
  );
}

/* =========================
   라우트 정의 (export)
   ========================= */
export const bookingRoutes = [
  {
    path: "/bookings",
    element: <BookingsLayout />,
    errorElement: <RouteErrorFallback />,
    children: [
      { index: true, loader: bookingsListLoader, element: <BookingsListPage /> },
      { path: "new", element: <BookingCreatePage />, action: bookingCreateAction, errorElement: <RouteErrorFallback /> },
      { path: ":id", loader: bookingDetailLoader, element: <BookingDetailPage />, errorElement: <RouteErrorFallback /> },
      { path: ":id/edit", element: <BookingEditPage />, action: bookingUpdateAction, errorElement: <RouteErrorFallback /> },
      { path: ":id/delete", action: bookingDeleteAction, errorElement: <RouteErrorFallback /> },

      // 선택: 사용자별 예약 목록
      { path: "user/:userId", loader: bookingsByUserLoader, element: <BookingsByUserPage />, errorElement: <RouteErrorFallback /> },
    ],
  },
];

/* =========================
   에러 파서
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
     ...bookingRoutes,
     // ...amenityRoutes, ...bookingRoomRoutes, ...
   ])
   ========================= */
