import BookingCreate from "./BookingCreate";
import BookingEdit from "./BookingEdit";
import BookingList from "./BookingList";
import BookongDetail from "./BookongDetail";

export default function BookingPage(){
    return (
        <div>
            <h1>예약</h1>
            <nav>
                <Link to="/booking">목록</Link> | <Link to="/booking/new">새 예약</Link>
            </nav>

            <Routes>
                <Route index element={<BookingList />} />
                <Route path="new" element={<BookingCreate />} />
                <Route path=":id" element={<BookongDetail />} />
                <Route path=":id/edit" element={<BookingEdit />} />
            </Routes>
        </div>
    );
}