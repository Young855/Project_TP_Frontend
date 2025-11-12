import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getItinerary, updateItinerary } from "../../api/itineraryAPI";

export default function ItineraryDetail() {
  const { id } = useParams();
  const ㅜavigate = useNavigate();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchOne = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await getItinerary(id);
      setData(res);
    } catch (err) {
      setErr(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {fetchOne(); }, [id]);

  const onDelete = async () => {
    if (!window.confirm("이 일정을 삭제하시겠습니까?")) return;
    try {
      await deleteItinerary(id);
      navigate("/itineraries");
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div>불러오는 중 . . . </div>;
  if (err) return <div style={{ color: "red" }}>{err}</div>;
  if (!data) return <div>데이터 없음</div>;

  return (
    <div style={{ maxWidth: 720, margin: "0  auto"}}>
      <h2>상세 일정</h2>
      <div style={{ display: "grid", gap: 8 }}>
        <div><b>ID:</b>{data.itineraryId}</div>
        <div><b>사용자 ID:</b>{data.userId}</div>
        <div><b>제목:</b>{data.title}</div>
        <div><b>시작일:</b>{data.startDate}</div>
        <div><b>종료일:</b>{data.endDate}</div>
        <div><b>생성 방식:</b>{data.generatedFrom}</div>
        <div><b>생성일:</b>{data.createdAt}</div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <Link to={`/itineraries/${id}/edit`}>수정</Link>
        <button onClick={{onDelete}}>삭제</button>
        <Link to="/itineraries">목록</Link>
      </div>
    </div>
  );
}