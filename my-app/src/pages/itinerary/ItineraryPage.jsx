import { Routes, Route, Navigate } from "react-router-dom";
import ItineraryList from "./ItineraryList";
import ItineraryCreate from "./ItineraryCreate";
import ItineraryDetail from "./ItineraryDetail";
import ItineraryEdit from "./ItineraryEdit";

/**
 * /itineraries         -> 목록
 * /itineraries/new     -> 생성
 * /itineraries/:id     -> 상세
 * /itineraries/:id/edit-> 수정
 */
export default function ItineraryPage() {
  return (
    <div style={{ padding: 16 }}>
      <Routes>
        <Route path="/" element={<ItineraryList />} />
        <Route path="/new" element={<ItineraryCreate />} />
        <Route path=":id" element={<ItineraryDetail />} />
        <Route path=":id/edit" element={<ItineraryEdit />} />
        {/* 안전장치 */}
        <Route path="/" element={<Navigate to="/itineraries" replace />} />
      </Routes>
    </div>
  );
}
