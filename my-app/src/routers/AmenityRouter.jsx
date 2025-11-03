// src/routers/AmenityRouter.jsx
import React from "react";
import { Outlet, Link, useNavigate, useLoaderData, useActionData, Form, redirect } from "react-router-dom";
import axios from "axios";
import { axiosConfig } from "../config"; 
const api = axios.create(axiosConfig);

function getAuth() {
  try {
    const raw = localStorage.getItem("auth"); 
    if (!raw) return null;
    return JSON.parse(raw);
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

export async function amenitiesListLoader({ request }) {
  const url = new URL(request.url);
  const page = url.searchParams.get("page") ?? 0;
  const size = url.searchParams.get("size") ?? 20;
  const sort = url.searchParams.get("sort") ?? "amenityId,desc";
  const keyword = url.searchParams.get("keyword") ?? "";

  const params = { page, size, sort };
  if (keyword) params.keyword = keyword;

  const { data } = await api.get("/amenities", { params });
  return { pageData: data, query: { page, size, sort, keyword } };
}

// 상세 로더
export async function amenityDetailLoader({ params }) {
  const { amenityId } = params;
  const { data } = await api.get(`/amenities/${amenityId}`);
  return { amenity: data };
}

/* =========================
   액션(폼 제출)
   ========================= */
// 생성
export async function amenityCreateAction({ request }) {
  assertAdminOrRedirect(request);
  const form = await request.formData();
  const payload = {
    code: (form.get("code") || "").toString().trim().toUpperCase(),
    name: (form.get("name") || "").toString().trim(),
  };

  try {
    const { data } = await api.post("/amenities", payload);
    return redirect(`/amenities/${data.amenityId}`);
  } catch (err) {
    return { error: parseApiError(err), values: payload };
  }
}

// 수정
export async function amenityUpdateAction({ request, params }) {
  assertAdminOrRedirect(request);
  const { amenityId } = params;
  const form = await request.formData();
  const payload = {
    code: (form.get("code") || "").toString().trim().toUpperCase(),
    name: (form.get("name") || "").toString().trim(),
  };

  try {
    await api.put(`/amenities/${amenityId}`, payload);
    return redirect(`/amenities/${amenityId}`);
  } catch (err) {
    return { error: parseApiError(err), values: { ...payload, amenityId } };
  }
}

// 삭제
export async function amenityDeleteAction({ request, params }) {
  assertAdminOrRedirect(request);
  const { amenityId } = params;
  try {
    await api.delete(`/amenities/${amenityId}`);
    return redirect(`/amenities`);
  } catch (err) {
    return { error: parseApiError(err) };
  }
}

/* =========================
   라우트 요소(최소 동작 UI)
   - 프로젝트의 실제 페이지 컴포넌트로 교체 가능
   ========================= */
function AmenitiesLayout() {
  return (
    <div className="container mx-auto p-4">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Amenities</h1>
        <Link className="underline" to="/amenities">목록</Link>
      </header>
      <Outlet />
    </div>
  );
}

function AmenitiesListPage() {
  const nav = useNavigate();
  const { pageData, query } = useLoaderData(); // { pageData, query }
  const list = pageData?.content ?? [];

  const nextPage = () => nav(`/amenities?page=${Number(query.page) + 1}&size=${query.size}&sort=${query.sort}&keyword=${query.keyword||""}`);
  const prevPage = () => nav(`/amenities?page=${Math.max(0, Number(query.page) - 1)}&size=${query.size}&sort=${query.sort}&keyword=${query.keyword||""}`);

  return (
    <div className="space-y-4">
      <Form method="get" className="flex gap-2">
        <input name="keyword" defaultValue={query.keyword} placeholder="검색(code/name)" className="border p-2 rounded" />
        <button className="border px-3 py-2 rounded" type="submit">검색</button>
      </Form>

      <div className="flex justify-end">
        <Link to="/amenities/new" className="border px-3 py-2 rounded">새로 만들기</Link>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-50">
            <th className="border p-2 text-left">ID</th>
            <th className="border p-2 text-left">CODE</th>
            <th className="border p-2 text-left">NAME</th>
            <th className="border p-2 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {list.map((a) => (
            <tr key={a.amenityId}>
              <td className="border p-2">{a.amenityId}</td>
              <td className="border p-2">{a.code}</td>
              <td className="border p-2">{a.name}</td>
              <td className="border p-2">
                <Link className="underline" to={`/amenities/${a.amenityId}`}>보기</Link>
              </td>
            </tr>
          ))}
          {list.length === 0 && (
            <tr><td className="p-4 text-center" colSpan={4}>데이터 없음</td></tr>
          )}
        </tbody>
      </table>

      <div className="flex justify-between">
        <button className="border px-3 py-1 rounded" onClick={prevPage} disabled={pageData?.first}>이전</button>
        <div>page {Number(query.page) + 1} / {pageData?.totalPages ?? 1}</div>
        <button className="border px-3 py-1 rounded" onClick={nextPage} disabled={pageData?.last}>다음</button>
      </div>
    </div>
  );
}

function AmenityDetailPage() {
  const { amenity } = useLoaderData(); // { amenityId, code, name }
  return (
    <div className="space-y-4">
      <div className="border p-4 rounded">
        <div><b>ID:</b> {amenity.amenityId}</div>
        <div><b>CODE:</b> {amenity.code}</div>
        <div><b>NAME:</b> {amenity.name}</div>
      </div>
      <div className="flex gap-2">
        <Link className="border px-3 py-2 rounded" to="edit">수정</Link>
        <Form method="post" action="delete" onSubmit={(e)=>{ if(!confirm("정말 삭제할까요?")) e.preventDefault(); }}>
          <button className="border px-3 py-2 rounded" type="submit">삭제</button>
        </Form>
        <Link className="underline px-3 py-2" to="/amenities">목록으로</Link>
      </div>
    </div>
  );
}

function AmenityFormPage({ mode }) {
  const actionData = useActionData(); // { error, values }
  const defaults = actionData?.values ?? {};
  const err = actionData?.error;

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
        <div className="flex flex-col">
          <label className="text-sm">CODE<span className="text-red-500">*</span></label>
          <input
            name="code"
            required
            defaultValue={defaults.code ?? ""}
            onChange={(e)=>{ e.target.value = e.target.value.toUpperCase(); }}
            pattern="^[A-Z0-9_]{1,50}$"
            title="대문자/숫자/언더스코어 1~50자"
            className="border p-2 rounded"
            placeholder="예: WIFI, PARKING"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm">NAME<span className="text-red-500">*</span></label>
          <input
            name="name"
            required
            defaultValue={defaults.name ?? ""}
            minLength={1}
            maxLength={100}
            className="border p-2 rounded"
            placeholder="예: 와이파이"
          />
        </div>

        <div className="flex gap-2">
          <button className="border px-3 py-2 rounded" type="submit">
            {mode === "edit" ? "수정 저장" : "생성"}
          </button>
          <Link className="underline px-3 py-2" to="/amenities">취소</Link>
        </div>
      </Form>
    </div>
  );
}

function AmenityCreatePage() {
  return <AmenityFormPage mode="create" />;
}

function AmenityEditPage() {
  // 상세 데이터를 폼 기본값으로 쓰고 싶으면 별도 loader를 두거나,
  // 여기서는 간단히 서버 검증 실패 시 반환되는 values에 의존.
  // 실제 프로젝트에서는 상세 로더를 같이 호출해 값 바인딩 권장.
  return <AmenityFormPage mode="edit" />;
}

function RouteErrorFallback() {
  return (
    <div className="p-4 border border-red-300 rounded bg-red-50">
      <div className="font-semibold">문제가 발생했습니다.</div>
      <div className="text-sm mt-1">잠시 후 다시 시도하거나, 목록으로 돌아가세요.</div>
      <Link className="underline" to="/amenities">목록으로</Link>
    </div>
  );
}

/* =========================
   라우트 정의
   - 메인 라우터에서 ...amenityRoutes 로 통합하세요.
   ========================= */
export const amenityRoutes = [
  {
    path: "amenities", // /amenities
    children: [
      {
        index: true,            // /amenities
        element: <AmenityList />,// 전체 편의시설 목록
      },
      {
        path: "create",         // /amenities/create
        element: <AmenityCreate />,// 편의시설 등록
      },
      {
        path: ":id",            // /amenities/:id
        element: <AmenityDetail />,// 편의시설 상세
      },
      {
        path: ":id/edit",       // /amenities/:id/edit
        element: <AmenityEdit />,// 편의시설 수정
      },
    ],
  },
];

export default AmenityRouter;
