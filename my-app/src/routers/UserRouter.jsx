// import UserList from "../pages/user/UserList";
import UserEdit from "../pages/user/UserEdit";
import SignupPage from "../pages/user/SignupPage";
import LoginPage from "../pages/user/LoginPage";

const UserRouter = [
  {
    path: "user",
    children: [
      // {
      //   index: true, 
      //   element: <UserList />,
      // },
      {
        path: "signup",   
        element: <SignupPage />,
      },
      {
        path: ":id/edit",     
        element: <UserEdit />,
      },
      {
        path: "login",
        element: <LoginPage/>
      },
    ],
  },
];

export default UserRouter;
