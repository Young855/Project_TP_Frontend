// src/routers/FavoriteRouter.jsx
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
  getAllFavorites,
  getFavorite,
  createFavorite,
  deleteFavorite,
} from "../api/favoriteAPI"; // <- 실제 파일 경로 확인

/* =========================
   인증 유틸 (프로젝트 정책에 맞게 수정)
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
   서버 TargetType 이 확장될 수 있으므로 배열로 유지
   ========================= */
const TARGET_TYPES = ["PROPERTY"]; // 필요 시 ["PROPERTY","ROOM","POST", ...] 확장

/* =========================
   로더 (데이터 선패칭)
   ========================= */
export async function favoritesListLoader() {
  const data = await getAllFavorites();
  const list = Array.isArray(data) ? data : data?.content ?? [];
  return { list };
}

export async function favoriteDetailLoader({ params }) {
  const id = Number(params.id);
  const item = await getFavorite(id);
  return { item };
}

/* =========================
   액션 (생성/삭제)
   ========================= */
function parseFormToPayload(fd) {
  const payload = {
    userId: Number(fd.get("userId")),
    targetType: String(fd.get("targetType") || "").toUpperCase(),
    targetId: Number(fd.get("targetId")),
  };

  if (!payload.userId || Number.isNaN(payload.userId)) {
    throw { validation: true, message: "userId는 필수입니다." };
  }
  if (!TARGET_TYPES.includes(payload.targetType)) {
    throw { validation: true, message: "targetType 값이 올바르지 않습니다." };
  }
  if (!payload.targetId || Number.isNaN(payload.targetId)) {
    throw { validation: true, message: "targetId는 필수입니다." };
  }
  return payload;
}

// 생성
export async function favoriteCreateAction({ request }) {
  assertLoggedInOrRedirect(request);
  const fd = await request.formData();
  try {
    const payload = parseFormToPayload(fd);
    const created = await createFavorite(payload);
    const id = created?.favoriteId ?? created?.id;
    return redirect(`/favorites/${id}`);
  } catch (err) {
    if (err?.validation) {
      return { error: { code: "VALIDATION", message: err.message }, values: Object.fromEntries(fd) };
    }
    return { error: parseApiError(err), values: Object.fromEntries(fd) };
  }
}

// 삭제
export async function favoriteDeleteAction({ request, params }) {
  assertLoggedInOrRedirect(request);
  const id = Number(params.id);
  try {
    await deleteFavorite(id);
    return redirect(`/favorites`);
  } catch (err) {
    return { error: parseApiError(err) };
  }
}

/* =========================
   최소 UI 컴포넌트
   ========================= */
function FavoritesLayout() {
  return (
    <div className="container mx-auto p-4">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Favorites</h1>
        <Link className="underline" to="/favorites">목록</Link>
      </header>
      <Outlet />
    </div>
  );
}

function FavoritesListPage() {
  const { list } = useLoaderData();
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link to="/favorites/new" className="border px-3 py-2 rounded">새로 만들기</Link>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-50">
            <th className="border p-2 text-left">ID</th>
            <th className="border p-2 text-left">User</th>
            <th className="border p-2 text-left">Target Type</th>
            <th className="border p-2 text-left">Target ID</th>
            <th className="border p-2 text-left">Created At</th>
            <th className="border p-2 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {list.map((f) => (
            <tr key={f.favoriteId ?? f.id}>
              <td className="border p-2">{f.favoriteId ?? f.id}</td>
              <td className="border p-2">{f.userId ?? f.user?.userId ?? "-"}</td>
              <td className="border p-2">{f.targetType}</td>
              <td className="border p-2">{f.targetId}</td>
              <td className="border p-2">{f.createdAt ?? "-"}</td>
              <td className="border p-2">
                <Link className="underline" to={`/favorites/${f.favoriteId ?? f.id}`}>보기</Link>
              </td>
            </tr>
          ))}
          {list.length === 0 && (
            <tr><td className="p-4 text-center" colSpan={6}>데이터 없음</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function FavoriteDetailPage() {
  const { item } = useLoaderData();
  const id = item.favoriteId ?? item.id;
  const userId = item.userId ?? item.user?.userId;

  return (
    <div className="space-y-4">
      <div className="border p-4 rounded">
        <div><b>ID:</b> {id}</div>
        <div><b>User:</b> {userId}</div>
        <div><b>Target Type:</b> {item.targetType}</div>
        <div><b>Target ID:</b> {item.targetId}</div>
        <div><b>Created At:</b> {item.createdAt ?? "-"}</div>
      </div>
      <div className="flex gap-2">
        {/* 수정 엔드포인트 없음 → edit 페이지 없음 */}
        <Form method="post" action="delete" onSubmit={(e)=>{ if(!confirm("정말 삭제할까요?")) e.preventDefault(); }}>
          <button className="border px-3 py-2 rounded" type="submit">삭제</button>
        </Form>
        <Link className="underline px-3 py-2" to="/favorites">목록으로</Link>
      </div>
    </div>
  );
}

function FavoriteCreatePage() {
  const actionData = useActionData(); // { error, values }
  const err = actionData?.error;
  const vals = actionData?.values ?? {};

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
            <label className="text-sm">User ID<span className="text-red-500">*</span></label>
            <input
              name="userId"
              type="number"
              required
              defaultValue={vals.userId ?? ""}
              className="border p-2 rounded"
              placeholder="예: 1001"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm">Target Type<span className="text-red-500">*</span></label>
            <select name="targetType" className="border p-2 rounded" defaultValue={vals.targetType ?? TARGET_TYPES[0]} required>
              {TARGET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm">Target ID<span className="text-red-500">*</span></label>
            <input
              name="targetId"
              type="number"
              required
              defaultValue={vals.targetId ?? ""}
              className="border p-2 rounded"
              placeholder="예: 2001"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button className="border px-3 py-2 rounded" type="submit">생성</button>
          <Link className="underline px-3 py-2" to="/favorites">취소</Link>
        </div>
      </Form>
    </div>
  );
}

function RouteErrorFallback() {
  return (
    <div className="p-4 border border-red-300 rounded bg-red-50">
      <div className="font-semibold">문제가 발생했습니다.</div>
      <div className="text-sm mt-1">잠시 후 다시 시도하거나, 목록으로 돌아가세요.</div>
      <Link className="underline" to="/favorites">목록으로</Link>
    </div>
  );
}

/* =========================
   라우트 정의 (export)
   ========================= */
export const favoriteRoutes = [
  {
    path: "/favorites",
    element: <FavoritesLayout />,
    errorElement: <RouteErrorFallback />,
    children: [
      { index: true, loader: favoritesListLoader, element: <FavoritesListPage /> },
      { path: "new", element: <FavoriteCreatePage />, action: favoriteCreateAction, errorElement: <RouteErrorFallback /> },
      { path: ":id", loader: favoriteDetailLoader, element: <FavoriteDetailPage />, errorElement: <RouteErrorFallback /> },
      { path: ":id/delete", action: favoriteDeleteAction, errorElement: <RouteErrorFallback /> },
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
     ...favoriteRoutes,
     // ...bookingRoutes, ...bookingRoomRoutes, ...
   ])
   ========================= */
