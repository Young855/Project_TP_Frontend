// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { getItinerary, updateItinerary } from "../../api/itineraryAPI";

// export default function ItineraryEdit() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [form, setForm] = useState({
//     title: "",
//     startDate: "",
//     endDate: "",
//     generatedFrom: "MANUAL",
//   });
//   const [err, setErr] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   useEffect(() => {
//     const fetchOne = async () => {
//       setErr("");
//       setLoading(true);
//       try {
//         const res = await getItinerary(id);
//         setForm({
//           title: res.title ?? "",
//           startDate: res.startDate ?? "",
//           endDate: res.endDate ?? "",
//           generatedFrom: res.generatedFrom ?? "MANUAL",
//         });
//       } catch (error) {
//         setErr(error.message);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchOne();
//   }, [id]);

//   const onChange = (e) => {
//     const { name, value } = e.target;
//     setForm((p) => ({ ...p, [name]: value }));
//   };

//   const onSubmit = async (e) => {
//     e.preventDefault();
//     setSaving(true);
//     setErr("");
//     try {
//       const updated = await updateItinerary(id, {
//         title: form.title.trim(),
//         startDate: form.startDate,
//         endDate: form.endDate,
//         generatedFrom: form.generatedFrom,
//       });
//       navigate(`/itineraries/${updated.itineraryId}`);
//     } catch (error) {
//       setErr(error.message);
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) return <div>불러오는 중...</div>;
//   if (err) return <div style={{ color: "red" }}>{err}</div>;

//   return (
//     <div style={{ maxWidth: 520, margin: "0 auto" }}>
//       <h2>일정 수정</h2>
//       <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
//         <label>
//           제목
//           <input
//             type="text"
//             name="title"
//             value={form.title}
//             onChange={onChange}
//             required
//           />
//         </label>
//         <label>
//           체크인
//           <input
//             type="date"
//             name="startDate"
//             value={form.startDate}
//             onChange={onChange}
//             required
//           />
//         </label>
//         <label>
//           체크아웃
//           <input
//             type="date"
//             name="endDate"
//             value={form.endDate}
//             onChange={onChange}
//             required
//           />
//         </label>
//         <label>
//           생성 방식
//           <select
//             name="generatedFrom"
//             value={form.generatedFrom}
//             onChange={onChange}
//             required
//           >
//             <option value="MANUAL">MANUAL</option>
//             <option value="RECOMMENDED">RECOMMENDED</option>
//           </select>
//         </label>
//         {err && <div style={{ color: "red" }}>{err}</div>}
//         <button type="submit" disabled={saving}>
//           {saving ? "저장 중..." : "저장"}
//         </button>
//       </form>
//     </div>
//   );
// }
