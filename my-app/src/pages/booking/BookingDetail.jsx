import { useEffect, useState } from "react";
import { getBooking } from "../../api/bookingAPI";

export default function BookongDetail(){
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [note, setNote] = useState("");
    const [busy, setBusy] = useState(false);

    const load = async () => {
        try {
            const res = await getBooking(id);
            setData(res);
        } catch (err) {
            alert(err.message);
        }
    };

    useEffect(() => { load(); }, [id]);

    const doCheckIn = async () => {
        if (!window.confirm("체크인 하곘습니까 ?")) return;
        setBusy(true);
        try {
            await checkInBooking(id);
            await load();
        } catch (err) {
            alert(err.message);
        } finally {
            setBusy(false);
        }
    };
    const onAddNote = async () => {
        const v = note.trim();
        if (!v) return;
        setBusy(true);
        try {
            await addBookingNote(id, v);
            setNote("");
            await load();
        } catch (err) {
            alert(err.message);
        } finally {
            setBusy(false);
        }
    };

    if (!data) return <div>불러오는 중 . . . </div>;

    return (
        <div>
            <h2>예약 #{data.id}</h2>
            <div>숙소: {data.propertyName ?? data.propertyId}</div>
            <div>객실: {data.roomName ?? data.roonId}</div>
            <div>기간: {data.checkIn} ~ {data.checkout}</div>
            <div>인원: {data.guests}</div>
            <div>상태: {data.status}</div>

            <p>
                <Link to={`/booking/${id}/edit`}>수정</Link>{" "}
                <button disabled={busy} onclick={doCheckIn}>체크인</button>{" "}
                <button disabled={busy} onclick={doCheckIn}>체크아웃</button>
            </p>

            <h3>메모</h3>
            <input 
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="메모 입력"
            />
            <button disabled={busy} onClick={onAddNote}>추가</button>

            {Array.isArray(data.notes) && data.notes.length > 0 && (
                <ul>
                    {data.notes.map((n, i) => <li key={i}>{n}</li>)}
                </ul>
            )}
        </div>
    );    
}