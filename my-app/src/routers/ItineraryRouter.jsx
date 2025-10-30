// src/routers/itineraryRouter.jsx
import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Link,
  useLoaderData,
  useNavigate,
  useParams,
  Form,
  redirect,
  json,
} from "react-router-dom";
import {
  getAllItineraries,
  getItinerary,
  createItinerary,
  updateItinerary,
  deleteItinerary,
} from "../api/itineraryAPI";

/* =========================
   Loaders / Actions
   ========================= */
// 목록
async function listLoader() {
  const data = await getAllItineraries();
  return json({ items: data });
}

// 상세
async function detailLoader({ params }) {
  const { id } = params;
  const data = await getItinerary(id);
  if (!data) throw json({ message: "Itinerary not found" }, { status: 404 });
  return json({ item: data });
}

// 생성
async function createAction({ request }) {
  const form = await request.formData();
  const payload = {
    title: form.get("title"),
    startDate: form.get("startDate"),
    endDate: form.get("endDate"),
    generatedFrom: form.get("generatedFrom"), // MANUAL | RECOMMENDED 등
    // 백엔드 DTO 규약에 따라 user 또는 userId 중 하나를 사용
    // 아래는 userId 예시. 필요 시 user: { userId: Number(...) }로 맞추세요.
    userId: form.get("userId") ? Number(form.get("userId")) : undefined,
  };

  await createItinerary(payload);
  return redirect("/itineraries");
}

// 수정
async function editAction({ request, params }) {
  const { id } = params;
  const form = await request.formData();
  const payload = {
    title: form.get("title"),
    startDate: form.get("startDate"),
    endDate: form.get("endDate"),
    generatedFrom: form.get("generatedFrom"),
    userId: form.get("userId") ? Number(form.get("userId")) : undefined,
  };

  await updateItinerary(id, payload);
  return redirect(`/itineraries/${id}`);
}

// 삭제 (상세 페이지에서 POST/DELETE 트리거)
async function deleteAction({ params }) {
  const { id } = params;
  await deleteItinerary(id);
  return redirect("/itineraries");
}

/* =========================
   Minimal Pages (동작 확인용)
   실프로덕션에서는 별도 파일로 분리 권장
   ========================= */

// 목록 페이지
function ItineraryListPage() {
  const { items } = useLoaderData();
  return (
    <div className="container mx-auto p-4">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Itineraries</h1>
        <Link
          to="/itineraries/new"
          className="px-3 py-2 rounded bg-blue-600 text-white"
        >
          새 일정 만들기
        </Link>
      </header>

      <ul className="space-y-2">
        {items?.map((it) => (
          <li key={it.itineraryId} className="border rounded p-3">
            <div className="font-semibold">{it.title}</div>
            <div className="text-sm text-gray-600">
              {it.startDate} ~ {it.endDate} ({it.generatedFrom})
            </div>
            <Link
              to={`/itineraries/${it.itineraryId}`}
              className="text-blue-600 underline text-sm"
            >
              상세 보기
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// 상세 페이지
function ItineraryDetailPage() {
  const { item } = useLoaderData();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">{item.title}</h1>
      <div className="text-gray-700">
        기간: {item.startDate} ~ {item.endDate}
      </div>
      <div className="text-gray-700">생성 방식: {item.generatedFrom}</div>
      <div className="flex gap-2">
        <button
          onClick={() => navigate(`/itineraries/${item.itineraryId}/edit`)}
          className="px-3 py-2 rounded bg-amber-600 text-white"
        >
          수정
        </button>

        {/* 삭제는 action 라우트로 POST 전송 */}
        <Form
          method="post"
          action={`/itineraries/${item.itineraryId}/delete`}
          onSubmit={(e) => {
            if (!confirm("정말 삭제할까요?")) e.preventDefault();
          }}
        >
          <button className="px-3 py-2 rounded bg-red-600 text-white">
            삭제
          </button>
        </Form>
      </div>
      <Link to="/itineraries" className="text-sm text-blue-600 underline">
        목록으로
      </Link>
    </div>
  );
}

// 생성 페이지
function ItineraryCreatePage() {
  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">새 일정 만들기</h1>
      <Form method="post" action="/itineraries/new" className="space-y-3">
        <div>
          <label className="block text-sm">제목</label>
          <input name="title" required className="border rounded p-2 w-full" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm">시작일</label>
            <input type="date" name="startDate" required className="border rounded p-2 w-full" />
          </div>
          <div>
            <label className="block text-sm">종료일</label>
            <input type="date" name="endDate" required className="border rounded p-2 w-full" />
          </div>
        </div>
        <div>
          <label className="block text-sm">생성 방식</label>
          <select name="generatedFrom" className="border rounded p-2 w-full" defaultValue="MANUAL">
            <option value="MANUAL">MANUAL</option>
            <option value="RECOMMENDED">RECOMMENDED</option>
          </select>
        </div>
        <div>
          <label className="block text-sm">User ID</label>
          <input type="number" name="userId" className="border rounded p-2 w-full" />
          <p className="text-xs text-gray-500">
            백엔드 DTO가 <code>userId</code> 또는 <code>user.userId</code>를 기대하는지에 맞춰 사용하세요.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded bg-blue-600 text-white">저장</button>
          <Link to="/itineraries" className="px-4 py-2 rounded border">취소</Link>
        </div>
      </Form>
    </div>
  );
}

// 수정 페이지
function ItineraryEditPage() {
  const { item } = useLoaderData();
  const { id } = useParams();

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">일정 수정</h1>
      <Form method="post" action={`/itineraries/${id}/edit`} className="space-y-3">
        <div>
          <label className="block text-sm">제목</label>
          <input
            name="title"
            defaultValue={item.title}
            required
            className="border rounded p-2 w-full"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm">시작일</label>
            <input
              type="date"
              name="startDate"
              defaultValue={item.startDate}
              required
              className="border rounded p-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm">종료일</label>
            <input
              type="date"
              name="endDate"
              defaultValue={item.endDate}
              required
              className="border rounded p-2 w-full"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm">생성 방식</label>
          <select
            name="generatedFrom"
            defaultValue={item.generatedFrom}
            className="border rounded p-2 w-full"
          >
            <option value="MANUAL">MANUAL</option>
            <option value="RECOMMENDED">RECOMMENDED</option>
          </select>
        </div>
        <div>
          <label className="block text-sm">User ID</label>
          <input
            type="number"
            name="userId"
            defaultValue={item.user?.userId}
            className="border rounded p-2 w-full"
          />
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded bg-amber-600 text-white">수정 저장</button>
          <Link to={`/itineraries/${id}`} className="px-4 py-2 rounded border">취소</Link>
        </div>
      </Form>
    </div>
  );
}

/* =========================
   Route Objects & Provider
   ========================= */

export const itineraryRoutes = [
  {
    path: "/itineraries",
    element: <ItineraryListPage />,
    loader: listLoader,
  },
  {
    path: "/itineraries/new",
    element: <ItineraryCreatePage />,
    action: createAction,
  },
  {
    path: "/itineraries/:id",
    element: <ItineraryDetailPage />,
    loader: detailLoader,
  },
  {
    path: "/itineraries/:id/edit",
    element: <ItineraryEditPage />,
    loader: detailLoader,
    action: editAction,
  },
  // delete 전용 action 라우트 (UI는 상세에서 Form POST)
  {
    path: "/itineraries/:id/delete",
    action: deleteAction,
  },
];

// 단독으로 테스트하고 싶을 때 사용 (App.jsx에 이 컴포넌트만 렌더)
export default function ItineraryRouter() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <div className="p-4"><Link to="/itineraries" className="text-blue-600 underline">Itineraries로 이동</Link></div>,
    },
    ...itineraryRoutes,
  ]);
  return <RouterProvider router={router} />;
}
