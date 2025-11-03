import RoomList from "../pages/room/RoomList";
import RoomCreate from "../pages/room/RoomCreate";
import RoomDetail from "../pages/room/RoomDetail";
import RoomList from "../pages/room/RoomList";

const RoomRouter = [
  {
    path: "rooom",
    children: [
      {
        index: true,
        element: <RoomList />
      },
      {
        path: "create",
        element: <RoomCreate />
      },
      {
        path: ":id",
        element: <RoomDetail />
      },
      {
        path: ":id/edit",
        element: <RoomEdit />,
      },
    ],
  },
];

export default RoomRouter;