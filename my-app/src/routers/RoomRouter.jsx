import RoomList from "../room/RoomList";
import RoomCreate from "../room/RoomCreate";
import RoomDetail from "../room/RoomDetail";
import RoomList from "../room/RoomList";

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