// src/routers/RoomRouter.jsx
import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  useLoaderData,
  Form,
  redirect,
  Link,
  json,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  getAllRooms,
  getRoom,
  getRoomsByPropertyId,
  createRoom,
  updateRoom,
  deleteRoom,
} from "../api/roomAPI";

/* =========================
   Loaders / Actions
   ========================= */

// 전체 객실 목록
export async function listLoader() {
  const data = await getAllRooms();
  return json({ rooms: data });
}

// 숙소별 객실 목록
export async function listByPropertyLoader({ params }) {
  const { propertyId } = params;
  const data = await getRoomsByPropertyId(propertyId);
  return json({ rooms: data, propertyId });
}

// 객실 상세
export async function detailLoader({ params }) {
  const { id } = params;
  const data = await getRoom(id);
  if (!data) throw json({ message: "Room not found" }, { status: 404 });
  return json({ room: data });
}

// 생성
export async function createAction({ request }) {
  const form = await request.formData();
  const payload = {
    propertyId: form.get("propertyId") ? Number(form.get("propertyId")) : undefined,
    name: form.get("name"),
    capacity: Number(form.get("capacity")),
    stock: Number(form.get("stock")),
    pricePerNight: Number(form.get("pricePerNight")),
    refundable: form.get("refundable") === "on" ? true : false,
  };
  await createRoom(payload);
  return redirect("/rooms");
}

// 수정
export async function editAction({ request, params }) {
  const { id } = params;
  const form = await request.formData();
  const payload = {
    propertyId: form.get("propertyId") ? Number(form.get("propertyId")) : undefined,
    name: form.get("name"),
    capacity: Number(form.get("capacity")),
    stock: Number(form.get("stock")),
    pricePerNight: Number(form.get("pricePerNight")),
    refundable: form.get("refundable") === "on" ? true : false,
  };
  await updateRoom(id, payload);
  return redirect(`/rooms/${id}`);
}

// 삭제
export async function deleteAction({ params }) {
  const { id } = params;
  await deleteRoom(id);
  return redirect("/rooms");
}

/* =========================
   Minimal Pages (테스트용)
   ========================= */

// 목록
function RoomListPage() {
  const { rooms } = useLoaderData();
  return (
    <div className="p-4 space-y-3">
      <header className="flex justify-between items-center">
        <h1 className="text-xl font-bold">객실 목록</h1>
        <Link
          to="/rooms/new"
          className="px-3 py-2 bg-blue-600 text-white rounded"
        >
          새 객실 등록
        </Link>
      </header>

      <ul className="space-y-2">
        {rooms?.map((r) => (
          <li key={r.roomId} className="border rounded p-3">
            <div className="font-semibold">{r.name}</div>
            <div className="text-gray-600 text-sm">
              수용인원 {r.capacity}명 · 재고 {r.stock} · {r.pricePerNight.toLocaleString()}원/박
            </div>
            <Link
              to={`/rooms/${r.roomId}`}
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

// 숙소별 객실 목록
function RoomsByPropertyPage() {
  const { rooms, propertyId } = useLoaderData();
  return (
    <div className="p-4 space-y-3">
      <h1 className="text-xl font-bold">숙소 #{propertyId}의 객실 목록</h1>
      <ul className="space-y-2">
        {rooms?.map((r) => (
          <li key={r.roomId} className="border rounded p-3">
            <div className="font-semibold">{r.name}</div>
            <div className="text-gray-600 text-sm">
              인원 {r.capacity}명 · 요금 {r.pricePerNight.toLocaleString()}원/박
            </div>
          </li>
        ))}
      </ul>
      <Link to="/rooms" className="text-blue-600 underline">
        전체 객실 보기
      </Link>
    </div>
  );
}

// 상세
function RoomDetailPage() {
  const { room } = useLoaderData();
  const navigate = useNavigate();
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">{room.name}</h1>
      <p>숙소 ID: {room.property?.propertyId}</p>
      <p>수용 인원: {room.capacity}</p>
      <p>재고: {room.stock}</p>
      <p>1박 요금: {room.pricePerNight.toLocaleString()}원</p>
      <p>환불 가능: {room.refundable ? "O" : "X"}</p>

      <div className="flex gap-2">
        <button
          onClick={() => navigate(`/rooms/${room.roomId}/edit`)}
          className="px-3 py-2 bg-amber-600 text-white rounded"
        >
          수정
        </button>

        <Form
          method="post"
          action={`/rooms/${room.roomId}/delete`}
          onSubmit={(e) => {
            if (!confirm("정말 삭제할까요?")) e.preventDefault();
          }}
        >
          <button className="px-3 py-2 bg-red-600 text-white rounded">
            삭제
          </button>
        </Form>
      </div>

      <Link to="/rooms" className="text-blue-600 underline">
        목록으로
      </Link>
    </div>
  );
}

// 생성
function RoomCreatePage() {
  return (
    <div className="p-4 space-y-3">
      <h1 className="text-xl font-bold">객실 등록</h1>
      <Form method="post" action="/rooms/new" className="space-y-3">
        <div>
          <label className="block text-sm">숙소 ID(Property ID)</label>
          <input name="propertyId" type="number" required className="border rounded p-2 w-full" />
        </div>
        <div>
          <label className="block text-sm">객실명</label>
          <input name="name" required className="border rounded p-2 w-full" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm">수용 인원</label>
            <input name="capacity" type="number" min="1" required className="border rounded p-2 w-full" />
          </div>
          <div>
            <label className="block text-sm">재고</label>
            <input name="stock" type="number" min="1" required className="border rounded p-2 w-full" />
          </div>
        </div>
        <div>
          <label className="block text-sm">1박 요금</label>
          <input name="pricePerNight" type="number" min="0" required className="border rounded p-2 w-full" />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" name="refundable" id="refundable" />
          <label htmlFor="refundable">환불 가능</label>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded">등록</button>
          <Link to="/rooms" className="px-4 py-2 border rounded">취소</Link>
        </div>
      </Form>
    </div>
  );
}

// 수정
function RoomEditPage() {
  const { room } = useLoaderData();
  const { id } = useParams();
  return (
    <div className="p-4 space-y-3">
      <h1 className="text-xl font-bold">객실 수정</h1>
      <Form method="post" action={`/rooms/${id}/edit`} className="space-y-3">
        <div>
          <label className="block text-sm">숙소 ID(Property ID)</label>
          <input
            name="propertyId"
            type="number"
            defaultValue={room.property?.propertyId}
            required
            className="border rounded p-2 w-full"
          />
        </div>
        <div>
          <label className="block text-sm">객실명</label>
          <input
            name="name"
            defaultValue={room.name}
            required
            className="border rounded p-2 w-full"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm">수용 인원</label>
            <input
              name="capacity"
              type="number"
              defaultValue={room.capacity}
              required
              className="border rounded p-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm">재고</label>
            <input
              name="stock"
              type="number"
              defaultValue={room.stock}
              required
              className="border rounded p-2 w-full"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm">1박 요금</label>
          <input
            name="pricePerNight"
            type="number"
            defaultValue={room.pricePerNight}
            required
            className="border rounded p-2 w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="refundable"
            id="refundable"
            defaultChecked={room.refundable}
          />
          <label htmlFor="refundable">환불 가능</label>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-amber-600 text-white rounded">수정 저장</button>
          <Link to={`/rooms/${id}`} className="px-4 py-2 border rounded">취소</Link>
        </div>
      </Form>
    </div>
  );
}

/* =========================
   Routes & Provider
   ========================= */

export const roomRoutes = [
  {
    path: "/rooms",
    element: <RoomListPage />,
    loader: listLoader,
  },
  {
    path: "/rooms/new",
    element: <RoomCreatePage />,
    action: createAction,
  },
  {
    path: "/rooms/:id",
    element: <RoomDetailPage />,
    loader: detailLoader,
  },
  {
    path: "/rooms/:id/edit",
    element: <RoomEditPage />,
    loader: detailLoader,
    action: editAction,
  },
  {
    path: "/rooms/:id/delete",
    action: deleteAction,
  },
  {
    path: "/properties/:propertyId/rooms",
    element: <RoomsByPropertyPage />,
    loader: listByPropertyLoader,
  },
];

// 단독 실행용
export default function RoomRouter() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <div className="p-4">
          <Link to="/rooms" className="text-blue-600 underline">
            객실 목록 보기
          </Link>
        </div>
      ),
    },
    ...roomRoutes,
  ]);
  return <RouterProvider router={router} />;
}
