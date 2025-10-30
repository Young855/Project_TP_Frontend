// src/routers/UserRouter.jsx
import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  useLoaderData,
  useNavigate,
  useParams,
  Form,
  Link,
  json,
  redirect,
} from "react-router-dom";
import {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  // loginUser, // 로그인 라우팅이 필요하면 추후 사용
} from "../api/userAPI";

/* =========================
   Loaders / Actions
   ========================= */

// 전체 유저 목록
export async function listLoader() {
  const data = await getAllUsers();
  return json({ users: data });
}

// 상세
export async function detailLoader({ params }) {
  const { id } = params;
  const data = await getUser(id);
  if (!data) throw json({ message: "User not found" }, { status: 404 });
  return json({ user: data });
}

// 생성
export async function createAction({ request }) {
  const form = await request.formData();
  const payload = {
    email: form.get("email"),
    password: form.get("password"), // ← 백엔드가 passwordHash를 요구하면 키명을 변경
    name: form.get("name"),
    nickname: form.get("nickname"),
    phone: form.get("phone") || null,
    birthDate: form.get("birthDate") || null, // yyyy-MM-dd
    role: form.get("role"), // USER | PARTNER | ADMIN 등
    isDeleted: form.get("isDeleted") === "on" ? true : false,
  };
  await createUser(payload);
  return redirect("/users");
}

// 수정
export async function editAction({ request, params }) {
  const { id } = params;
  const form = await request.formData();
  const payload = {
    email: form.get("email"),
    // 비밀번호 변경이 없으면 빈값으로 두거나 키를 제거하는 게 안전.
    // 여기선 값이 있으면 보냄.
    ...(form.get("password") ? { password: form.get("password") } : {}),
    name: form.get("name"),
    nickname: form.get("nickname"),
    phone: form.get("phone") || null,
    birthDate: form.get("birthDate") || null,
    role: form.get("role"),
    isDeleted: form.get("isDeleted") === "on" ? true : false,
  };
  await updateUser(id, payload);
  return redirect(`/users/${id}`);
}

// 삭제 (상세 페이지에서 POST로 트리거)
export async function deleteAction({ params }) {
  const { id } = params;
  await deleteUser(id);
  return redirect("/users");
}

/* =========================
   Minimal Pages (동작 확인용)
   ========================= */

// 목록 페이지
function UserListPage() {
  const { users } = useLoaderData();
  return (
    <div className="p-4 space-y-3">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">유저 목록</h1>
        <Link to="/users/new" className="px-3 py-2 rounded bg-blue-600 text-white">
          새 유저 생성
        </Link>
      </header>

      <div className="border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">이메일</th>
              <th className="p-2 text-left">이름</th>
              <th className="p-2 text-left">닉네임</th>
              <th className="p-2 text-left">역할</th>
              <th className="p-2 text-left">상태</th>
              <th className="p-2 text-left">관리</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((u) => (
              <tr key={u.userId} className="border-t">
                <td className="p-2">{u.userId}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.name}</td>
                <td className="p-2">{u.nickname}</td>
                <td className="p-2">{u.role}</td>
                <td className="p-2">{u.isDeleted ? "탈퇴" : "활성"}</td>
                <td className="p-2">
                  <Link className="text-blue-600 underline" to={`/users/${u.userId}`}>
                    상세
                  </Link>
                </td>
              </tr>
            ))}
            {!users?.length && (
              <tr>
                <td className="p-3 text-gray-500" colSpan={7}>
                  데이터가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 상세 페이지
function UserDetailPage() {
  const { user } = useLoaderData();
  const navigate = useNavigate();
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">유저 상세</h1>
      <div className="space-y-1">
        <div><b>ID:</b> {user.userId}</div>
        <div><b>이메일:</b> {user.email}</div>
        <div><b>이름:</b> {user.name}</div>
        <div><b>닉네임:</b> {user.nickname}</div>
        <div><b>전화번호:</b> {user.phone || "-"}</div>
        <div><b>생년월일:</b> {user.birthDate || "-"}</div>
        <div><b>역할:</b> {user.role}</div>
        <div><b>상태:</b> {user.isDeleted ? "탈퇴" : "활성"}</div>
        <div><b>생성일:</b> {user.createdAt}</div>
        <div><b>수정일:</b> {user.updatedAt}</div>
      </div>

      <div className="flex gap-2">
        <button
          className="px-3 py-2 bg-amber-600 text-white rounded"
          onClick={() => navigate(`/users/${user.userId}/edit`)}
        >
          수정
        </button>

        <Form
          method="post"
          action={`/users/${user.userId}/delete`}
          onSubmit={(e) => {
            if (!confirm("정말 삭제(탈퇴 처리)할까요?")) e.preventDefault();
          }}
        >
          <button className="px-3 py-2 bg-red-600 text-white rounded">
            삭제
          </button>
        </Form>
      </div>

      <Link to="/users" className="text-blue-600 underline">목록으로</Link>
    </div>
  );
}

// 생성 페이지
function UserCreatePage() {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">유저 생성</h1>
      <Form method="post" action="/users/new" className="space-y-3">
        <div>
          <label className="block text-sm">이메일</label>
          <input name="email" type="email" required className="border rounded p-2 w-full" />
        </div>
        <div>
          <label className="block text-sm">비밀번호</label>
          <input name="password" type="password" required className="border rounded p-2 w-full" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm">이름</label>
            <input name="name" required className="border rounded p-2 w-full" />
          </div>
          <div>
            <label className="block text-sm">닉네임</label>
            <input name="nickname" required className="border rounded p-2 w-full" />
          </div>
        </div>
        <div>
          <label className="block text-sm">전화번호</label>
          <input name="phone" className="border rounded p-2 w-full" placeholder="010-1234-5678" />
        </div>
        <div>
          <label className="block text-sm">생년월일</label>
          <input name="birthDate" type="date" className="border rounded p-2 w-full" />
        </div>
        <div>
          <label className="block text-sm">역할(AccountRole)</label>
          <select name="role" className="border rounded p-2 w-full" defaultValue="USER">
            <option value="USER">USER</option>
            <option value="PARTNER">PARTNER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input id="isDeleted" type="checkbox" name="isDeleted" />
          <label htmlFor="isDeleted" className="text-sm">탈퇴 처리로 생성</label>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded bg-blue-600 text-white">저장</button>
          <Link to="/users" className="px-4 py-2 rounded border">취소</Link>
        </div>
      </Form>
    </div>
  );
}

// 수정 페이지
function UserEditPage() {
  const { user } = useLoaderData();
  const { id } = useParams();
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">유저 수정</h1>
      <Form method="post" action={`/users/${id}/edit`} className="space-y-3">
        <div>
          <label className="block text-sm">이메일</label>
          <input name="email" type="email" defaultValue={user.email} required className="border rounded p-2 w-full" />
        </div>
        <div>
          <label className="block text-sm">비밀번호 (변경 시에만 입력)</label>
          <input name="password" type="password" placeholder="**** 변경 시에만 입력" className="border rounded p-2 w-full" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm">이름</label>
            <input name="name" defaultValue={user.name} required className="border rounded p-2 w-full" />
          </div>
          <div>
            <label className="block text-sm">닉네임</label>
            <input name="nickname" defaultValue={user.nickname} required className="border rounded p-2 w-full" />
          </div>
        </div>
        <div>
          <label className="block text-sm">전화번호</label>
          <input name="phone" defaultValue={user.phone || ""} className="border rounded p-2 w-full" />
        </div>
        <div>
          <label className="block text-sm">생년월일</label>
          <input name="birthDate" type="date" defaultValue={user.birthDate || ""} className="border rounded p-2 w-full" />
        </div>
        <div>
          <label className="block text-sm">역할(AccountRole)</label>
          <select name="role" defaultValue={user.role} className="border rounded p-2 w-full">
            <option value="USER">USER</option>
            <option value="PARTNER">PARTNER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input id="isDeleted" type="checkbox" name="isDeleted" defaultChecked={user.isDeleted} />
          <label htmlFor="isDeleted" className="text-sm">탈퇴 처리</label>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded bg-amber-600 text-white">수정 저장</button>
          <Link to={`/users/${id}`} className="px-4 py-2 rounded border">취소</Link>
        </div>
      </Form>
    </div>
  );
}

/* =========================
   Route Objects & Provider
   ========================= */

export const userRoutes = [
  {
    path: "/users",
    element: <UserListPage />,
    loader: listLoader,
  },
  {
    path: "/users/new",
    element: <UserCreatePage />,
    action: createAction,
  },
  {
    path: "/users/:id",
    element: <UserDetailPage />,
    loader: detailLoader,
  },
  {
    path: "/users/:id/edit",
    element: <UserEditPage />,
    loader: detailLoader,
    action: editAction,
  },
  {
    path: "/users/:id/delete",
    action: deleteAction,
  },
];

// 독립 실행용 (원하면 App.jsx에서 이 컴포넌트만 렌더해도 됨)
export default function UserRouter() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <div className="p-4">
          <Link to="/users" className="text-blue-600 underline">유저 목록으로</Link>
        </div>
      ),
    },
    ...userRoutes,
  ]);
  return <RouterProvider router={router} />;
}
