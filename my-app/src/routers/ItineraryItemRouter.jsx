// src/routers/ItineraryItemRouter.jsx
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

// ✅ 제공한 래퍼 사용(경로는 프로젝트에 맞게 조정)
import {
  getAllItineraryItems,
  getItineraryItem,
  createItineraryItem,
  updateItineraryItem,
  deleteItineraryItem,
} from "../api/itineraryItemAPI"; // <- 실제 파일 경로 확인

/* =========================
   인증 유틸 (프로젝트 정책에 맞게 조정)
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
   서버 ItemType: 예) PROPERTY | POI
   ========================= */
const ITEM_TYPES = ["PROPERTY", "POI"];

/* =========================
   도우미: 값 파싱/검증
   ========================= */
function normalizeTime(s) {
  // 허용: "HH:mm" 또는 빈 값
  if (!s) return "";
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(s);
  if (!m) throw { validation: true, message: "시간은 HH:mm 형식이어야 합니다." };
  return s;
}

function toNumberOrNull(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

function validateLatLon(lat, lon) {
  if (lat !== null) {
    if (lat < -90 || lat > 90) throw { validation: true, message: "위도(latitude)는 -90~90 범위여야 합니다." };
  }
  if (lon !== null) {
    if (lon < -180 || lon > 180) throw { validation: true, message: "경도(longitude)는 -180~180 범위여야 합니다." };
  }
}

function parseFormToPayload(fd) {
  const itineraryId = toNumberOrNull(fd.get("itineraryId"));
  const startTime = normalizeTime(fd.get("startTime") || "");
  const endTime = normalizeTime(fd.get("endTime") || "");
  const itemType = String(fd.get("itemType") || "").toUpperCase();
  const refId = toNumberOrNull(fd.get("refId"));
  const title = String(fd.get("title") || "").trim();
  const note = String(fd.get("note") || "").trim();
  const latitude = fd.get("latitude") === "" ? null : Number(fd.get("latitude"));
  const longitude = fd.get("longitude") === "" ? null : Number(fd.get("longitude"));
  const sortOrder = fd.get("sortOrder") === "" ? null : Number(fd.get("sortOrder"));

  // 필수값 검증
  if (!itineraryId) throw { validation: true, message: "itineraryId는 필수입니다." };
  if (!ITEM_TYPES.includes(itemType)) throw { validation: true, message: "itemType 값이 올바르지 않습니다." };
  if (!title) throw { validation: true, message: "title은 필수입니다." };
  if (title.length > 255) throw { validation: true, message: "title은 255자 이하여야 합니다." };
  if (note && note.length > 500) throw { validation: true, message: "note는 500자 이하여야 합니다." };
  if (sortOrder !== null && sortOrder < 0) throw { validation: true, message: "sortOrder는 0 이상이어야 합니다." };

  // 시간 논리 검증
  if (startTime && endTime) {
    if (endTime <= startTime) throw { validation: true, message: "endTime은 startTime보다 뒤여야 합니다." };
  }

  // 좌표 범위 검증
  validateLatLon(latitude, longitude);

  // 서버가 기대하는 필드 네이밍에 맞춰 전달
  return {
    itineraryId,
    startTime: startTime || null,
    endTime: endTime || null,
    itemType,
    refId,
    title,
    note: note || null,
    latitude,   // 백엔드 BigDecimal(precision=10, scale=7) → 숫자 전달
    longitude,  // 동일
    sortOrder,
  };
}

/* =========================
   로더 (데이터 선패칭)
   ========================= */
export async function itineraryItemsListLoader() {
  const data = await getAllItineraryItems();
  const list = Array.isArray(data) ? data : data?.content ?? [];
  return { list };
}

export async function itineraryItemDetailLoader({ params }) {
  const id = Number(params.id);
  const item = await getItineraryItem(id);
  return { item };
}

/* =========================
   액션 (생성/수정/삭제)
   ========================= */
export async function itineraryItemCreateAction({ request }) {
  assertLoggedInOrRedirect(request);
  const fd = await request.formData();
  try {
    const payload = parseFormToPayload(fd);
    const created = await createItineraryItem(payload);
    const id = created?.itemId ?? created?.id;
    return redirect(`/itinerary-items/${id}`);
  } catch (err) {
    if (err?.validation) {
      return { error: { code: "VALIDATION", message: err.message }, values: Object.fromEntries(fd) };
    }
    return { error: parseApiError(err), values: Object.fromEntries(fd) };
  }
}

export async function itineraryItemUpdateAction({ request, params }) {
  assertLoggedInOrRedirect(request);
  const id = Number(params.id);
  const fd = await request.formData();
  try {
    const payload = parseFormToPayload(fd);
    await updateItineraryItem(id, payload);
    return redirect(`/itinerary-items/${id}`);
  } catch (err) {
    if (err?.validation) {
      return { error: { code: "VALIDATION", message: err.message }, values: { id, ...Object.fromEntries(fd) } };
    }
    return { error: parseApiError(err), values: { id, ...Object.fromEntries(fd) } };
  }
}

export async function itineraryItemDeleteAction({ request, params }) {
  assertLoggedInOrRedirect(request);
  const id = Number(params.id);
  try {
    await deleteItineraryItem(id);
    return redirect(`/itinerary-items`);
  } catch (err) {
    return { error: parseApiError(err) };
  }
}

/* =========================
   최소 UI 컴포넌트
   ========================= */
function ItineraryItemsLayout() {
  return (
    <div className="container mx-auto p-4">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Itinerary Items</h1>
        <Link className="underline" to="/itinerary-items">목록</Link>
      </header>
      <Outlet />
    </div>
  );
}

function ItineraryItemsListPage() {
  const { list } = useLoaderData();
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link to="/itinerary-items/new" className="border px-3 py-2 rounded">새로 만들기</Link>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-50">
            <th className="border p-2 text-left">ID</th>
            <th className="border p-2 text-left">Itinerary</th>
            <th className="border p-2 text-left">Type</th>
            <th className="border p-2 text-left">Title</th>
            <th className="border p-2 text-left">Time</th>
            <th className="border p-2 text-left">Lat, Lon</th>
            <th className="border p-2 text-left">Order</th>
            <th className="border p-2 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {list.map((x) => (
            <tr key={x.itemId ?? x.id}>
              <td className="border p-2">{x.itemId ?? x.id}</td>
              <td className="border p-2">{x.itineraryId ?? x.itinerary?.itineraryId ?? "-"}</td>
              <td className="border p-2">{x.itemType}</td>
              <td className="border p-2">{x.title}</td>
              <td className="border p-2">
                {(x.startTime ?? "-")} ~ {(x.endTime ?? "-")}
              </td>
              <td className="border p-2">
                {x.latitude ?? "-"}, {x.longitude ?? "-"}
              </td>
              <td className="border p-2">{x.sortOrder ?? "-"}</td>
              <td className="border p-2">
                <Link className="underline" to={`/itinerary-items/${x.itemId ?? x.id}`}>보기</Link>
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

function ItineraryItemDetailPage() {
  const { item } = useLoaderData();
  const id = item.itemId ?? item.id;
  const itineraryId = item.itineraryId ?? item.itinerary?.itineraryId;

  return (
    <div className="space-y-4">
      <div className="border p-4 rounded">
        <div><b>ID:</b> {id}</div>
        <div><b>Itinerary:</b> {itineraryId}</div>
        <div><b>Type:</b> {item.itemType}</div>
        <div><b>Title:</b> {item.title}</div>
        <div><b>Note:</b> {item.note ?? "-"}</div>
        <div><b>Time:</b> {(item.startTime ?? "-")} ~ {(item.endTime ?? "-")}</div>
        <div><b>Ref ID:</b> {item.refId ?? "-"}</div>
        <div><b>Lat/Lon:</b> {(item.latitude ?? "-")}, {(item.longitude ?? "-")}</div>
        <div><b>Order:</b> {item.sortOrder ?? "-"}</div>
      </div>

      <div className="flex gap-2">
        <Link className="border px-3 py-2 rounded" to="edit">수정</Link>
        <Form method="post" action="delete" onSubmit={(e)=>{ if(!confirm("정말 삭제할까요?")) e.preventDefault(); }}>
          <button className="border px-3 py-2 rounded" type="submit">삭제</button>
        </Form>
        <Link className="underline px-3 py-2" to="/itinerary-items">목록으로</Link>
      </div>
    </div>
  );
}

function ItineraryItemForm({ mode }) {
  const actionData = useActionData(); // { error, values }
  const vals = actionData?.values ?? {};
  const isEdit = mode === "edit";

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
            <label className="text-sm">Itinerary ID<span className="text-red-500">*</span></label>
            <input
              name="itineraryId"
              type="number"
              required
              defaultValue={vals.itineraryId ?? ""}
              className="border p-2 rounded"
              placeholder="예: 5001"
              disabled={false /* 필요 시 특정 일정에 고정 */}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm">Item Type<span className="text-red-500">*</span></label>
            <select name="itemType" className="border p-2 rounded" defaultValue={vals.itemType ?? ITEM_TYPES[0]} required>
              {ITEM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm">Title<span className="text-red-500">*</span></label>
            <input
              name="title"
              required
              maxLength={255}
              defaultValue={vals.title ?? ""}
              className="border p-2 rounded"
              placeholder="항목 제목"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm">Note</label>
            <input
              name="note"
              maxLength={500}
              defaultValue={vals.note ?? ""}
              className="border p-2 rounded"
              placeholder="메모(최대 500자)"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm">Start Time</label>
            <input
              name="startTime"
              type="time"
              defaultValue={vals.startTime ?? ""}
              className="border p-2 rounded"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm">End Time</label>
            <input
              name="endTime"
              type="time"
              defaultValue={vals.endTime ?? ""}
              className="border p-2 rounded"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm">Ref ID</label>
            <input
              name="refId"
              type="number"
              defaultValue={vals.refId ?? ""}
              className="border p-2 rounded"
              placeholder="연결 대상 ID (Property/POI)"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm">Latitude</label>
            <input
              name="latitude"
              type="number"
              step="0.0000001"
              min={-90}
              max={90}
              defaultValue={vals.latitude ?? ""}
              className="border p-2 rounded"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm">Longitude</label>
            <input
              name="longitude"
              type="number"
              step="0.0000001"
              min={-180}
              max={180}
              defaultValue={vals.longitude ?? ""}
              className="border p-2 rounded"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm">Sort Order</label>
            <input
              name="sortOrder"
              type="number"
              min={0}
              defaultValue={vals.sortOrder ?? ""}
              className="border p-2 rounded"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button className="border px-3 py-2 rounded" type="submit">
            {isEdit ? "수정 저장" : "생성"}
          </button>
          <Link className="underline px-3 py-2" to="/itinerary-items">취소</Link>
        </div>
      </Form>
    </div>
  );
}

function ItineraryItemCreatePage() { return <ItineraryItemForm mode="create" />; }
function ItineraryItemEditPage() { return <ItineraryItemForm mode="edit" />; }

function RouteErrorFallback() {
  return (
    <div className="p-4 border border-red-300 rounded bg-red-50">
      <div className="font-semibold">문제가 발생했습니다.</div>
      <div className="text-sm mt-1">잠시 후 다시 시도하거나, 목록으로 돌아가세요.</div>
      <Link className="underline" to="/itinerary-items">목록으로</Link>
    </div>
  );
}

/* =========================
   라우트 정의 (export)
   ========================= */
export const itineraryItemRoutes = [
  {
    path: "/itinerary-items",
    element: <ItineraryItemsLayout />,
    errorElement: <RouteErrorFallback />,
    children: [
      { index: true, loader: itineraryItemsListLoader, element: <ItineraryItemsListPage /> },
      { path: "new", element: <ItineraryItemCreatePage />, action: itineraryItemCreateAction, errorElement: <RouteErrorFallback /> },
      { path: ":id", loader: itineraryItemDetailLoader, element: <ItineraryItemDetailPage />, errorElement: <RouteErrorFallback /> },
      { path: ":id/edit", element: <ItineraryItemEditPage />, action: itineraryItemUpdateAction, errorElement: <RouteErrorFallback /> },
      { path: ":id/delete", action: itineraryItemDeleteAction, errorElement: <RouteErrorFallback /> },
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
     ...itineraryItemRoutes,
     // ...itineraryRoutes, ...bookingRoutes, ...
   ])
   ========================= */
