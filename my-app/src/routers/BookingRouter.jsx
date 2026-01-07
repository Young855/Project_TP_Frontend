import BookingList from "../pages/booking/BookingList";
import BookingCreate from "../pages/booking/BookingCreate";
import BookingDetail from "../pages/booking/BookingDetail";
import BookingEdit from "../pages/booking/BookingEdit";

const BookingRouter = [
  {
    path: "booking",
    children: [
      {
        index: true,
        element: <BookingList />
      },
      {
        path: "new",
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