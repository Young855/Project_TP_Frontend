import { Children } from "react";
import BookingRoomList from "../pages/bookingroom/BookingRoomList";
import BookingRoomCreate from "../pages/bookingroom/BookingRoomCreate";
import BookingRoomDetail from "../pages/bookingroom/BookingRoomDetail";
import BookingRoomEdit from "../pages/bookingroom/BookingRoomEdit";

const BookingRoomRouter = [
  {
    path: "boards",
    children: [
      {
        index: true,
        element: <BookingRoomList />
      },
      {
        path: "create",
        element: <BookingRoomCreate />
      },
      {
        path: ":id",
        element: <BookingRoomDetail />
      },
      {
        path: ":id/edit",
        element: <BookingRoomEdit />
      }
    ]
  },
];