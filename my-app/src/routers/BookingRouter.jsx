import { Children } from "react";
import BookingList from "../pages/booking/BookingList";
import BookingCreate from "../pages/booking/BookingCreate";
import BookingDetail from "../pages/booking/BookongDetail";
import BookingEdit from "../pages/booking/BookingEdit";

const BookingRouter = [
  {
    path: "boards",
    children: [
      {
        index: true,
        element: <BookingList />
      },
      {
        path: "create",
        element: <BookingCreate />
      },
      {
        path: ":id",
        element: <BookingDetail />
      },
      {
        path: ":id/edit",
        element: <BookingEdit />
      }
    ]
  },
];

export default BookingRouter;