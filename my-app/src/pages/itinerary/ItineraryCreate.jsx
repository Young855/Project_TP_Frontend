import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ItineraryCreate({ defaultUserId}){
  const navigate = useNavigate();
  const [form, setForm] = useState({
    userId: defaultUserId ?? "",
    title: "",
    startDate: "",
    endDate: "",
    generatedForm: "MANUAL",
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const created = await createItinerary({
        userId: Number(form.userId),
        title: form.title.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        generatedForm: form.generatedForm,
      });
      navigate(`/itineraries/${created.itineraryId}`);
    } catch (err) {
      setErr(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: "0 auto"}}>
      <h2>일정 생성</h2>
      {err && <div style={{ color: "red", marginBottom: 12 }}>{err}</div>}
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label> 
          사용자 ID
          <input type="number"
                 name="userId"
                 value={form.userId}
                 onChange={onChange}
                 required
          />
        </label>
        <label>
          시작일
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={onChange}
            required
          />
        </label>
        <label>
          종료일
          <input 
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={onChange}
            required
          />
        </label>
        <label>
          생성 방식
          <select 
            name="generatedFrom" 
            value={form.generatedForm}
            onChange={onChange}
            required
          >
            <option value="MANUAL">메뉴얼</option>
            <option value="RECOMMENDED">추천</option>
          </select>
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "생성 중 . . . " : "생성"}
        </button>
      </form>
    </div>
  );

}