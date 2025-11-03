import RoomList from "../pages/room/RoomList";
import RoomCreate from "../pages/room/RoomCreate";
import RoomDetail from "../pages/room/RoomDetail";
import RoomEdit from "../pages/room/RoomEdit";

const RoomRouter = [
  {
    path: "rooms", // 기본 경로: /rooms
    children: [
      {
        index: true, // /rooms
        element: <RoomList />, // 전체 객실 목록 페이지
      },
      {
        path: "create", // /rooms/create
        element: <RoomCreate />, // 객실 등록 페이지
      },
      {
        path: ":id", // /rooms/:id
        element: <RoomDetail />, // 객실 상세 페이지
      },
      {
        path: ":id/edit", // /rooms/:id/edit
        element: <RoomEdit />, // 객실 수정 페이지
      },
      {
        path: "property/:propertyId", // /rooms/property/:propertyId
        element: <RoomList />, // 숙소별 객실 목록 조회 (같은 리스트 컴포넌트 재활용)
      },
    ],
  },
];

export default RoomRouter;
