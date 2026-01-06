import BookingList from "../pages/booking/BookingList";
import BookingCreate from "../pages/booking/BookingCreate";
import BookingDetail from "../pages/booking/BookingDetail";
const BookingRouter = [
  {
    path: "boards",
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
      // {
      //   path: ":id/edit",
      //   element: <BookingPage />
      // }
    ]
  },
];

export default BookingRouter;