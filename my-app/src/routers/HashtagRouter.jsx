// src/routers/HashtagRouter.jsx
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

// ✅ 제공한 래퍼 사용 (경로는 프로젝트 구조에 맞게 조정)
import {
  getAllHashtags,
  getHashtag,
  createHashtag,
  updateHashtag,
  deleteHashtag,
} from "../api/hashtagAPI"; // <- 실제 위치 확인

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
   보조: 태그 정규화
   - 앞의 '#' 제거, 공백 트림, 길이 제한
   ========================= */
function normalizeTag(raw) {
  if (typeof raw !== "string") return "";
  let t = raw.trim();
  if (t.startsWith("#")) t = t.slice(1);
  return t;
}

/* =========================
   로더 (데이터 선패칭)
   ========================= */
export async function hashtagsListLoader() {
  const data = await getAllHashtags();
  const list = Array.isArray(data) ? data : data?.content ?? [];
  return { list };
}

export async function hashtagDetailLoader({ params }) {
  const id = Number(params.id);
  const item = await getHashtag(id);
  return { item };
}

/* =========================
   액션 (생성/수정/삭제)
   ========================= */
function parseForm(fd) {
  const tag = normalizeTag(fd.get("tag") || "");
  if (!tag) throw { validation: true, message: "태그명을 입력하세요." };
  if (tag.length > 100) throw { validation: true, message: "태그명은 100자 이하여야 합니다." };
  return { tag };
}

// 생성
export async function hashtagCreateAction({ request }) {
  assertLoggedInOrRedirect(request);
  const fd = await request.formData();
  try {
    const payload = parseForm(fd);
    const created = await createHashtag(payload);
    const id = created?.hashtagId ?? created?.id;
    return redirect(`/hashtags/${id}`);
  } catch (err) {
    if (err?.validation) {
      return { error: { code: "VALIDATION", message: err.message }, values: Object.fromEntries(fd) };
    }
    return { error: parseApiError(err), values: Object.fromEntries(fd) };
  }
}

// 수정
export async function hashtagUpdateAction({ request, params }) {
  assertLoggedInOrRedirect(request);
  const id = Number(params.id);
  const fd = await request.formData();
  try {
    const payload = parseForm(fd);
    await updateHashtag(id, payload);
    return redirect(`/hashtags/${id}`);
  } catch (err) {
    if (err?.validation) {
      return { error: { code: "VALIDATION", message: err.message }, values: Object.fromEntries(fd) };
    }
    return { error: parseApiError(err), values: Object.fromEntries(fd) };
  }
}

// 삭제
export async function hashtagDeleteAction({ request, params }) {
  assertLoggedInOrRedirect(request);
  const id = Number(params.id);
  try {
    await deleteHashtag(id);
    return redirect(`/hashtags`);
  } catch (err) {
    return { error: parseApiError(err) };
  }
}

/* =========================
   최소 UI 컴포넌트
   ========================= */
function HashtagsLayout() {
  return (
    <div className="container mx-auto p-4">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Hashtags</h1>
        <Link className="underline" to="/hashtags">목록</Link>
      </header>
      <Outlet />
    </div>
  );
}

function HashtagsListPage() {
  const { list } = useLoaderData();
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link to="/hashtags/new" className="border px-3 py-2 rounded">새로 만들기</Link>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-50">
            <th className="border p-2 text-left">ID</th>
            <th className="border p-2 text-left">Tag</th>
            <th className="border p-2 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {list.map((h) => (
            <tr key={h.hashtagId ?? h.id}>
              <td className="border p-2">{h.hashtagId ?? h.id}</td>
              <td className="border p-2">#{h.tag ?? ""}</td>
              <td className="border p-2">
                <Link className="underline" to={`/hashtags/${h.hashtagId ?? h.id}`}>보기</Link>
              </td>
            </tr>
          ))}
          {list.length === 0 && (
            <tr><td className="p-4 text-center" colSpan={3}>데이터 없음</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function HashtagDetailPage() {
  const { item } = useLoaderData();
  const id = item.hashtagId ?? item.id;

  return (
    <div className="space-y-4">
      <div className="border p-4 rounded">
        <div><b>ID:</b> {id}</div>
        <div><b>Tag:</b> #{item.tag}</div>
      </div>
      <div className="flex gap-2">
        <Link className="border px-3 py-2 rounded" to="edit">수정</Link>
        <Form method="post" action="delete" onSubmit={(e)=>{ if(!confirm("정말 삭제할까요?")) e.preventDefault(); }}>
          <button className="border px-3 py-2 rounded" type="submit">삭제</button>
        </Form>
        <Link className="underline px-3 py-2" to="/hashtags">목록으로</Link>
      </div>
    </div>
  );
}

function HashtagForm({ mode }) {
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
        <div className="flex flex-col">
          <label className="text-sm">Tag<span className="text-red-500">*</span></label>
          <input
            name="tag"
            required
            defaultValue={vals.tag ?? ""}
            maxLength={100}
            className="border p-2 rounded"
            placeholder="#힐링 또는 힐링"
            onChange={(e) => {
              // 입력 시에도 앞의 '#'만 제거해서 내부 값 정규화
              const v = e.target.value;
              e.target.value = v.startsWith("#") ? v.slice(1) : v;
            }}
          />
          <p className="text-xs text-gray-500 mt-1">입력은 ‘힐링’으로 저장되며, 표시 시 자동으로 ‘#힐링’으로 렌더링됩니다.</p>
        </div>

        <div className="flex gap-2">
          <button className="border px-3 py-2 rounded" type="submit">
            {isEdit ? "수정 저장" : "생성"}
          </button>
          <Link className="underline px-3 py-2" to="/hashtags">취소</Link>
        </div>
      </Form>
    </div>
  );
}

function HashtagCreatePage() { return <HashtagForm mode="create" />; }
function HashtagEditPage() { return <HashtagForm mode="edit" />; }

function RouteErrorFallback() {
  return (
    <div className="p-4 border border-red-300 rounded bg-red-50">
      <div className="font-semibold">문제가 발생했습니다.</div>
      <div className="text-sm mt-1">잠시 후 다시 시도하거나, 목록으로 돌아가세요.</div>
      <Link className="underline" to="/hashtags">목록으로</Link>
    </div>
  );
}

/* =========================
   라우트 정의 (export)
   ========================= */
export const hashtagRoutes = [
  {
    path: "/hashtags",
    element: <HashtagsLayout />,
    errorElement: <RouteErrorFallback />,
    children: [
      { index: true, loader: hashtagsListLoader, element: <HashtagsListPage /> },
      { path: "new", element: <HashtagCreatePage />, action: hashtagCreateAction, errorElement: <RouteErrorFallback /> },
      { path: ":id", loader: hashtagDetailLoader, element: <HashtagDetailPage />, errorElement: <RouteErrorFallback /> },
      { path: ":id/edit", element: <HashtagEditPage />, action: hashtagUpdateAction, errorElement: <RouteErrorFallback /> },
      { path: ":id/delete", action: hashtagDeleteAction, errorElement: <RouteErrorFallback /> },
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
     ...hashtagRoutes,
     // ...favoriteRoutes, ...bookingRoutes, ...
   ])
   ========================= */
