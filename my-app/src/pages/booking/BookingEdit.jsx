import { useEffect, useState } from "react";
import { getBooking, updateBooking } from "../../api/bookingAPI";

export default function BookingEdit(){
    const { id } = useParams();
    const nav = useNavigate();
    const [form, setForm] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const data = await getBooking(id);
                setForm({
                    userId: data.userId ?? "",
                    propertyId: data.propertyId ?? "",
                    roomId: data.roomId ?? "",
                    checkIn: data.checkIn ?? "", 
                    checkOut: data.checkOut ?? "",
                    guests: data.guests ?? 1,
                    note: data.note ?? ""
                });
            } catch (e) {
                alert(e.message);
            }
        })();
    }, [id]);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...form,
                userId: form.userId ? Number(form.userId) : undefined,
                propertyId: form.propertyId ? Number(form.propertyId) : undefined,
                roomId: form.roomId ? Number(form.roomId) : undefined,
                guests: Number(form.guests)
            };
            await updateBooking(id, payload);
            alert("수정되었다.");
            nav(`/booking/${id}`);
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (!form) return <div>불러오는 중 . . . </div>;

    return (
        <form onSubmit={onSubmit}>
            <label>User ID <input name="userId" value={form.userId} onChange={onChange} /></label><br/>
            <label>Property ID <input name="propertyId" value={form.propertyId} onChange={onChange} /></label><br/>
            <label>Room Id <input name="roomId" value={form.roomID} onChange={onChange} /></label><br/>
            <label>Check In <input type="date" name="checkIn" value={form.checkIn} onChange={onChange} /></label><br/>
            <label>Check Out<input type="date" name="checkOut" value={form.checkOut} onChange={onChange} /></label><br/>
            <label>Guests <input type="number" name="guests" value={form.guests} onChange={onChange} /></label><br/>
            <label>Note <textarea name="note" value={form.note} onChange={onChange} rows={3} /></label><br/>
            <button disabled={saving} type="submit">{saving ? "저장 중. . ." : "저장"}</button>
            <button type="button"  onClick={() => window.history.back()}>취소</button>
        </form>
    )
}