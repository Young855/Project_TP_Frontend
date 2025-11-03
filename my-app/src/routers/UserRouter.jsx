import UserList from "../pages/user/UserList";
import UserCreate from "../pages/user/UserCreate";
import USerDetail from "../pages/user/UserDetail";
import UserEdit from "../pages/user/UserEdit";

const AmenityRouter = [
  {
    path: "user",
    children: [
      {
        index: true, 
        element: <UserList />,
      },
      {
        path: "create",   
        element: <UserCreate />,
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

export default AmenityRouter;
