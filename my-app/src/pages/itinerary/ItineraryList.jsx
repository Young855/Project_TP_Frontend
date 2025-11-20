import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getItineraries, deleteItinerary } from "../../api/itineraryAPI";

export default function ItineraryList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [filters, setFilters] = useState({
    userId: "",
    from: "",
    to: "",
  });

  //달력 열기용 ref
  const fromRef = useRef(null);
  const toRef = useRef(null);

  const fetchList = async () => {
    setErr("");
    setLoading(true);
    try {
      const params = {};
      if (filters.userId.trim() !== "") {
        params.userId = Number(filters.userId);
      }
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;

      const data = await getItineraries(params);
      setItems(data);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || error.message;
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const onSearch = (e) => {
    e.preventDefault();

    if (filters.from && filters.to) {
      const fromDate = new Date(filters.from);
      const toDate = new Date(filters.to);
      if (toDate <= fromDate) {
        alert("종료일은 시작일 다음 날 이후여야 합니다.");
        return;
      }
    }
    fetchList();
  };

  const onDelete = async (id) => {
    if (!window.confirm("삭제하시겠습니까?")) return;
    try {
      await deleteItinerary(id);
      fetchList();
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      alert(msg);
    }
  };

  return (
    <div style={{ maxWidth: 980, margin: "0 auto" }}>
      {/* 제목과 필터 간격 */}
      <h2 style={{ marginBottom: 20 }}>일정 목록</h2>

      <form
        onSubmit={onSearch}
        style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 16,
          alignItems: "flex-end",
        }}
      >
        {/* 사용자 ID */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ marginBottom: 4 }}>사용자 ID</label>
          <input
            type="text"
            name="userId"
            value={filters.userId}
            onChange={onChange}
            placeholder="ID를 입력"
            style={{ width: 200 }}
          />
        </div>

        {/* 1. 시작일 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            cursor: "pointer",
          }}
          onClick={() => {
            // 전체 영역 클릭 시 달력 열기
            if (fromRef.current && fromRef.current.showPicker) {
              fromRef.current.showPicker();
            } else if (fromRef.current) {
              fromRef.current.focus();
            }
          }}
        >
          <label style={{ marginBottom: 4 }}>체크인</label>
          <input
            ref={fromRef}
            type="date"
            name="from"
            value={filters.from}
            onChange={onChange}
            // input 자체 클릭은 기본 동작 유지
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* 2. 종료일  */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            cursor: "pointer",
          }}
          onClick={() => {
            if (toRef.current && toRef.current.showPicker) {
              toRef.current.showPicker();
            } else if (toRef.current) {
              toRef.current.focus();
            }
          }}
        >
          <label style={{ marginBottom: 4 }}>체크아웃</label>
          <input
            ref={toRef}
            type="date"
            name="to"
            value={filters.to}
            onChange={onChange}
            min={filters.from || undefined}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* 3. 검색 버튼 */}
        <button
          type="submit"
          style={{
            height: 38,
            padding: "0 20px",
            fontWeight: 600,
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            backgroundColor: "#111827",
            color: "#ffffff",
            whiteSpace: "nowrap",
          }}
        >
          검색
        </button>

        <Link
          to="/itineraries/new"
          style={{
            height: 38,
            display: "inline-flex",
            alignItems: "center",
            fontWeight: 600,
          }}
        >
          새 일정
        </Link>
      </form>

      {loading && <div>불러오는 중...</div>}
      {err && <div style={{ color: "red" }}>{err}</div>}

      {!loading && !err && items.length === 0 && <div>데이터 없음</div>}

      {!loading && !err && items.length > 0 && (
        <table
          width="100%"
          cellPadding="8"
          style={{ borderCollapse: "collapse" }}
        >
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
              <tr
                key={it.itineraryId}
                style={{ borderBottom: "1px solid #f1f1f1" }}
              >
                <td>{it.itineraryId}</td>
                <td>{it.userId}</td>
                <td>
                  <Link to={`/itineraries/${it.itineraryId}`}>
                    {it.title}
                  </Link>
                </td>
                <td>{it.startDate}</td>
                <td>{it.endDate}</td>
                <td>{it.generatedFrom}</td>
                <td style={{ display: "flex", gap: 6 }}>
                  <Link to={`/itineraries/${it.itineraryId}/edit`}>수정</Link>
                  <button type="button" onClick={() => onDelete(it.itineraryId)}>
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
