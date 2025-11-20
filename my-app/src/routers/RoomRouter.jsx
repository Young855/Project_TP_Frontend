import React from 'react';
import RoomList from "../pages/room/RoomList";
import RoomCreate from "../pages/room/RoomCreate";
import RoomDetail from "../pages/room/RoomDetail";
import RoomEdit from "../pages/room/RoomEdit"; 

const RoomRouter = [
  {
    path: "rooms", // "rooom" 오타 수정
    children: [
      {
        index: true,
        element: <RoomList /> // /partner/rooms
      },
      {
        path: "new", // create -> new (일관성)
        element: <RoomCreate /> // /partner/rooms/new
      },
      {
        path: ":id",
        element: <RoomDetail /> // /partner/rooms/1
      },
      {
        path: ":id/edit",
        element: <RoomEdit /> // /partner/rooms/1/edit
      },
    ],
  },
];

export default RoomRouter;