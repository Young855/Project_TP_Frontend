import UserList from "../pages/user/UserList";
import UserCreate from "../pages/user/UserCreate";
import UserDetail from "../pages/user/UserDetail";
import UserEdit from "../pages/user/UserEdit";
import UserLogin from "../pages/user/UserLogin";

const UserRouter = [
  {
    path: "users", // 기본 경로: /users
    children: [
      {
        index: true, // /users
        element: <UserList />, // 전체 사용자 목록
      },
      {
        path: "create", // /users/create
        element: <UserCreate />, // 회원가입
      },
      {
        path: "login", // /users/login
        element: <UserLogin />, // 로그인 페이지
      },
      {
        path: ":id", // /users/:id
        element: <UserDetail />, // 사용자 상세정보
      },
      {
        path: ":id/edit", // /users/:id/edit
        element: <UserEdit />, // 사용자 정보 수정
      },
    ],
  },
];

export default UserRouter;
