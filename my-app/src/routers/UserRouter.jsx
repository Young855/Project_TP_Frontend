import UserList from "../pages/user/UserList";
import USerDetail from "../pages/user/UserDetail";
import UserEdit from "../pages/user/UserEdit";
import SignupPage from "../pages/user/SignupPage";

const UserRouter = [
  {
    path: "user",
    children: [
      {
        index: true, 
        element: <UserList />,
      },
      {
        path: "signup",   
        element: <SignupPage />,
      },
      {
        path: ":id",            
        element: <USerDetail />,
      },
      {
        path: ":id/edit",     
        element: <UserEdit />,
      },
    ],
  },
];

export default UserRouter;
