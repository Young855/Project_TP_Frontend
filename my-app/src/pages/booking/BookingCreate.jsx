import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createBooking } from "../../api/bookingAPI";

export default function BookingCreate() {
    const nav = useNavigate();
    const [searchParams] = useSearchParams();

    // /bookings/new?userId=1 이런 식으로 들어온다고 가정
    const userIdFromQuery = searchParams.get("userId") || "";

    const [form, setForm] = useState({
        userId: userIdFromQuery, // URL에서 받은 값
        propertyId: "",
        roomId: "",
        checkIn: "",
        checkOut: "",
        guests: 2,
        note: "",
    });

    const [saving, setSaving] = useState(false);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,                  // ??
            [name]: value,
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        if (!form.userId) {
            alert("userId가 없다. URL에 ?userId= 값을 넣으시오.");
            return;
        }

        try{
            setSaving(true);

        const payload = {
            userId: Number(form.userId),
            propertyId: Number(form.propertyId),
            roomId: Number(form.roomId),
            checkIn: form.checkIn,
            checkOut: form.checkOut,
            guests: Number(form.guests),
            note: form.note,
        };

        const res = await createBooking(payload);
        const id = res?.id;

        alert("예약이 완료 되었습니다.");


        // /booking 페이지 라우터에 맞춰 이동
        if (id) {
            nav(`/bookings/${id}?userId=${form.userId}`);
        } else {
            nav(`/bookings?userId=${form.userId}`);
        }
    } catch (err) {
        console.error(err);
        alert("예약 오류")
    }finally {
        setSaving(false);
    }
};

    return (
        <form onSubmit={onSubmit}>
            {/* userId는 숨겨둠 */}
            <input type="hidden" name="userId" value={form.userId} />

            <label>
                숙소 {" "}
                <input
                  name="propertyId"
                  value={form.propertyId}
                  onChange={onChange}
                  />
            </label>
            <br />

            <label> 
                방 {" "}
                <input 
                  name="roomId"
                  value={form.roomId}
                  onChange={onChange}
                  />
            </label>
            <br />

            <label>
                체크인{" "}
                <input 
                  type="date"
                  name="checkIn"
                  value={form.checkIn}
                  onChange={onChange}
                />
            </label>
            <br />

            <label>
                체크아웃{" "}
                <input 
                  type="date"
                  name="checkOut"
                  value={form.checkOut}
                  onChange={onChange}
                />
            </label>
            <br />

            <label>
                인원{" "}
                <input 
                  type="number"
                  name="guests"
                  min={1}
                  value={form.guests}
                  onChange={onChange}
                />
            </label>
            <br />
 
            <label>
                요청 사항{" "}
                <textarea
                  name="note"
                  rows={3}
                  value={form.note}
                  onChange={onChange}  
                />
            </label>
            <br />

            <button disabled={saving} type="submit">
                {saving ? "저장 중...." : "예약 저장"}
            </button>
            <button type="button" onClick={() => window.history.back()}>
                취소
            </button>
       </form>
    );
}