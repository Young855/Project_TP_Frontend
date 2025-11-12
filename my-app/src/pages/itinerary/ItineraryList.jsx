import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getItinerary, updateItinerary } from "../../api/itineraryAPI";

const toFromForBackend = (fromDateStr) =>
  fromDateStr ? `${fromDateStr}T00:00:00` : undefined;

export default function ItineraryList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [filters, setFilters] = useState({
    userId: "",
    from: "",
    to: "",
  });

  const fetchList = async () => {
    setErr("");
    setLoading(true);
    try {
      const params = {};
      if (filters.userId) params.userId = Number(filters.userId);
      if (filters.from) params.from = toFromForBackend(filters.from); 
      if (filters.to) params.to = filters.to;
      
      const data = await getItineraries(params);
      setItems(data);
    } catch (error) {
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(); /* 초기 로드 */ }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFilters((p) => ({ ...p, [name]: value }));
  };

  const onSearch = (e) => {
    e.preventDefault();
    fetchList();
  };

  const onDelete = async (id) => {
    if (!window.confirm("삭제하시겠습니까?")) return;
    try {
      await deleteItinerary(id);
      fetchList();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div style={{ maxWidth: 980, margin: "0 auto" }}>
      <h2>일정 목록</h2>
      <form onSubmit={onSearch} style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <input
          type="number"
          name="userId"
          value={filters.userId}
          onChange={onChange}
          placeholder="사용자 ID"
          style={{ width: 140 }}
        />
        <input
          type="date"
          name="from"
          value={filters.from}
          onChange={onChange}
          placeholder="from"
        />
        <input
          type="date"
          name="to"
          value={filters.to}
          onChange={onChange}
          placeholder="to"
        />
        <button type="submit">검색</button>
        <Link to="/itineraries/new">새 일정</Link>
      </form>

      {loading && <div>불러오는 중...</div>}
      {err && <div style={{ color: "red" }}>{err}</div>}

      {!loading && items.length === 0 && <div>데이터 없음</div>}

      {!loading && items.length > 0 && (
        <table width="100%" cellPadding="8" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #ddd" }}>
              <th align="left">ID</th>
              <th align="left">User</th>
              <th align="left">제목</th>
              <th align="left">시작일</th>
              <th align="left">종료일</th>
              <th align="left">생성방식</th>
              <th align="left">액션</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.itineraryId} style={{ borderBottom: "1px solid #f1f1f1" }}>
                <td>{it.itineraryId}</td>
                <td>{it.userId}</td>
                <td>
                  <Link to={`/itineraries/${it.itineraryId}`}>{it.title}</Link>
                </td>
                <td>{it.startDate}</td>
                <td>{it.endDate}</td>
                <td>{it.generatedFrom}</td>
                <td style={{ display: "flex", gap: 6 }}>
                  <Link to={`/itineraries/${it.itineraryId}/edit`}>수정</Link>
                  <button onClick={() => onDelete(it.itineraryId)}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
