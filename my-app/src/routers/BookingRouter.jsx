import React from "react";
import BookingList from "../pages/booking/BookingList";
import BookingCreate from "../pages/booking/BookingCreate";
import BookingDetail from "../pages/booking/BookingDetail";
import BookingEdit from "../pages/booking/BookingEdit";

/**
 * BookingRouter
 * - createBrowserRouter에 전달할 route 배열
 * - base path: /bookings
 */
const BookingRouter = [
  {
    path: "bookings",
    children: [
      { index: true, element: <BookingList /> },           // /bookings
      { path: "create", element: <BookingCreate /> },      // /bookings/create
      { path: ":id", element: <BookingDetail /> },         // /bookings/:id
      { path: ":id/edit", element: <BookingEdit /> },      // /bookings/:id/edit
    ],
  },
];

export default BookingRouter;
