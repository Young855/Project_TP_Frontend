// src/routers/PropertyRouter.jsx
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
  getAllProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
} from "../api/propertyAPI";

/* ------------------------------
   Loaders / Actions
--------------------------------*/
export async function listLoader() {
  const data = await getAllProperties();
  return json({ properties: data });
}

export async function detailLoader({ params }) {
  const { id } = params;
  const data = await getProperty(id);
  if (!data) throw json({ message: "Property not found" }, { status: 404 });
  return json({ property: data });
}

export async function createAction({ request }) {
  const form = await request.formData();
  const payload = {
    name: form.get("name"),
    address: form.get("address"),
    city: form.get("city"),
    description: form.get("description"),
    propertyType: form.get("propertyType"),
    partnerId: form.get("partnerId") ? Number(form.get("partnerId")) : undefined,
  };
  await createProperty(payload);
  return redirect("/properties");
}

export async function editAction({ request, params }) {
  const { id } = params;
  const form = await request.formData();
  const payload = {
    name: form.get("name"),
    address: form.get("address"),
    city: form.get("city"),
    description: form.get("description"),
    propertyType: form.get("propertyType"),
    partnerId: form.get("partnerId") ? Number(form.get("partnerId")) : undefined,
  };
  await updateProperty(id, payload);
  return redirect(`/properties/${id}`);
}

export async function deleteAction({ params }) {
  const { id } = params;
  await deleteProperty(id);
  return redirect("/properties");
}

/* ------------------------------
   Minimal Pages (테스트용)
--------------------------------*/
function PropertyListPage() {
  const { properties } = useLoaderData();
  return (
    <div className="p-4 space-y-3">
      <header className="flex justify-between items-center">
        <h1 className="text-xl font-bold">숙소 목록</h1>
        <Link
          to="/properties/new"
          className="px-3 py-2 rounded bg-blue-600 text-white"
        >
          새 숙소 등록
        </Link>
      </header>
      <ul className="space-y-2">
        {properties.map((p) => (
          <li key={p.propertyId} className="border rounded p-3">
            <div className="font-semibold">{p.name}</div>
            <div className="text-gray-600 text-sm">{p.address}</div>
            <Link
              to={`/properties/${p.propertyId}`}
              className="text-blue-600 text-sm underline"
            >
              상세 보기
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PropertyDetailPage() {
  const { property } = useLoaderData();
  const navigate = useNavigate();
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">{property.name}</h1>
      <p className="text-gray-700">{property.description}</p>
      <p>주소: {property.address}</p>
      <p>도시: {property.city}</p>
      <p>유형: {property.propertyType}</p>
      <div className="flex gap-2">
        <button
          onClick={() => navigate(`/properties/${property.propertyId}/edit`)}
          className="px-3 py-2 bg-amber-600 text-white rounded"
        >
          수정
        </button>
        <Form
          method="post"
          action={`/properties/${property.propertyId}/delete`}
          onSubmit={(e) => {
            if (!confirm("정말 삭제할까요?")) e.preventDefault();
          }}
        >
          <button className="px-3 py-2 bg-red-600 text-white rounded">
            삭제
          </button>
        </Form>
      </div>
      <Link to="/properties" className="text-blue-600 underline">
        목록으로
      </Link>
    </div>
  );
}

function PropertyCreatePage() {
  return (
    <div className="p-4 space-y-3">
      <h1 className="text-xl font-bold">숙소 등록</h1>
      <Form method="post" action="/properties/new" className="space-y-3">
        <div>
          <label className="block text-sm">이름</label>
          <input name="name" className="border rounded p-2 w-full" required />
        </div>
        <div>
          <label className="block text-sm">주소</label>
          <input name="address" className="border rounded p-2 w-full" required />
        </div>
        <div>
          <label className="block text-sm">도시</label>
          <input name="city" className="border rounded p-2 w-full" />
        </div>
        <div>
          <label className="block text-sm">숙소 설명</label>
          <textarea
            name="description"
            className="border rounded p-2 w-full"
          ></textarea>
        </div>
        <div>
          <label className="block text-sm">유형(PropertyType)</label>
          <select
            name="propertyType"
            className="border rounded p-2 w-full"
            defaultValue="HOTEL"
          >
            <option value="HOTEL">HOTEL</option>
            <option value="HOUSE">HOUSE</option>
            <option value="RESORT">RESORT</option>
          </select>
        </div>
        <div>
          <label className="block text-sm">파트너 ID</label>
          <input type="number" name="partnerId" className="border rounded p-2 w-full" />
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded">저장</button>
          <Link to="/properties" className="px-4 py-2 border rounded">취소</Link>
        </div>
      </Form>
    </div>
  );
}

function PropertyEditPage() {
  const { property } = useLoaderData();
  const { id } = useParams();
  return (
    <div className="p-4 space-y-3">
      <h1 className="text-xl font-bold">숙소 수정</h1>
      <Form method="post" action={`/properties/${id}/edit`} className="space-y-3">
        <div>
          <label className="block text-sm">이름</label>
          <input
            name="name"
            defaultValue={property.name}
            className="border rounded p-2 w-full"
            required
          />
        </div>
        <div>
          <label className="block text-sm">주소</label>
          <input
            name="address"
            defaultValue={property.address}
            className="border rounded p-2 w-full"
            required
          />
        </div>
        <div>
          <label className="block text-sm">도시</label>
          <input
            name="city"
            defaultValue={property.city}
            className="border rounded p-2 w-full"
          />
        </div>
        <div>
          <label className="block text-sm">숙소 설명</label>
          <textarea
            name="description"
            defaultValue={property.description}
            className="border rounded p-2 w-full"
          ></textarea>
        </div>
        <div>
          <label className="block text-sm">유형(PropertyType)</label>
          <select
            name="propertyType"
            defaultValue={property.propertyType}
            className="border rounded p-2 w-full"
          >
            <option value="HOTEL">HOTEL</option>
            <option value="HOUSE">HOUSE</option>
            <option value="RESORT">RESORT</option>
          </select>
        </div>
        <div>
          <label className="block text-sm">파트너 ID</label>
          <input
            type="number"
            name="partnerId"
            defaultValue={property.partner?.partnerId}
            className="border rounded p-2 w-full"
          />
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-amber-600 text-white rounded">
            수정 저장
          </button>
          <Link to={`/properties/${id}`} className="px-4 py-2 border rounded">
            취소
          </Link>
        </div>
      </Form>
    </div>
  );
}

/* ------------------------------
   Route objects & provider
--------------------------------*/
export const propertyRoutes = [
  {
    path: "/properties",
    element: <PropertyListPage />,
    loader: listLoader,
  },
  {
    path: "/properties/new",
    element: <PropertyCreatePage />,
    action: createAction,
  },
  {
    path: "/properties/:id",
    element: <PropertyDetailPage />,
    loader: detailLoader,
  },
  {
    path: "/properties/:id/edit",
    element: <PropertyEditPage />,
    loader: detailLoader,
    action: editAction,
  },
  {
    path: "/properties/:id/delete",
    action: deleteAction,
  },
];

// 독립 실행용
export default function PropertyRouter() {
  const router = createBrowserRouter([
    { path: "/", element: <Link to="/properties" className="text-blue-600 underline p-4">숙소 목록 보기</Link> },
    ...propertyRoutes,
  ]);
  return <RouterProvider router={router} />;
}
