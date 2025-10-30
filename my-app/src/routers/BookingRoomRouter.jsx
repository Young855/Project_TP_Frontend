import React from "react";

// 페이지 컴포넌트 (프로젝트 구조에 맞게 경로 조정)
import BookingRoomList from "../pages/bookingRoom/BookingRoomList";
import BookingRoomCreate from "../pages/bookingRoom/BookingRoomCreate";
import BookingRoomDetail from "../pages/bookingRoom/BookingRoomDetail";
import BookingRoomEdit from "../pages/bookingRoom/BookingRoomEdit";

/**
 * BookingRoomRouter
 * - base path: /bookingrooms
 * - 복합키(bookinId, roomId) 경로 파라미터 사용
 */
const BookingRoomRouter = [
  {
    path: "bookingrooms",
    children: [
      {
        index: true,                      // /bookingrooms
        element: <BookingRoomList />,
      },
      {
        path: "create",                   // /bookingrooms/create
        element: <BookingRoomCreate />,
      },
      {
        path: ":bookingId/:roomId",       // /bookingrooms/:bookingId/:roomId
        element: <BookingRoomDetail />,
      },
      {
        path: ":bookingId/:roomId/edit",  // /bookingrooms/:bookingId/:roomId/edit
        element: <BookingRoomEdit />,
      },
    ],
  },
];

export default BookingRoomRouter;
