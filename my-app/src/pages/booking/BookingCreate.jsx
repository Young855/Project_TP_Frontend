import { useState } from "react";
import { createBooking } from "../../api/bookingAPI";

export default function BookingCreate(){
    const nav = useNavigate();
    const [form, setForm] = useState({
        userId: "",
        propertyId: "",
        roomId: "",
        checkIn: "",
        checkOut: "",
        guests: 2, // 초기 기본 설정값 | 2명에서 늘리거나 줄일 수 있다
        note: ""
    });
    const [saving, setSaving] = useState(false);

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
            const res = await createBooking(payload);
            const id = res?.id;
            alert("예약 완료");
            nav(id ? `/booking/${id}` : "/booking");
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

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