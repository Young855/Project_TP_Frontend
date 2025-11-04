import { Children } from "react";
import BookingList from "../booking/BookingList";
import BookingCreate from "../booking/BookingCreate";
import BookingDetail from "../booking/BookongDetail";
import BookingEdit from "../booking/BookingEdit";

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