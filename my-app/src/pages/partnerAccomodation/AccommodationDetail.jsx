import { useState } from "react";
import { useNavigate, useParams, useLoaderData, Link } from "react-router-dom"; 
import { deleteAccommodation } from "../../api/accommodationAPI";
import { usePartner } from "../../context/PartnerContext"; 

const AccommodationDetailPage = () => {
  const { accommodation } = useLoaderData();
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { refreshPartnerData } = usePartner();
  
  // 2. 삭제 진행 상태를 관리하는 State 추가
  const [isDeleting, setIsDeleting] = useState(false);

  const partnerPk = accommodation.partnerId; 

  const handleDelete = async () => {
    // 이미 삭제 중이면 중복 실행 방지
    if (isDeleting) return;

    if (window.confirm(`숙소 '${accommodation.name}'을(를) 정말 삭제하시겠습니까?`)) {
        try {
            // 로딩 시작 (버튼 잠금)
            setIsDeleting(true);

            // 1. API 삭제 요청
            await deleteAccommodation(id);
            
            // 2. 전역 컨텍스트 갱신
            await refreshPartnerData();
            
            // 3. 목록 페이지로 이동
            navigate('/partner/accommodations'); 
        } catch (error) {
            console.error(error);
            alert("숙소 삭제 중 오류가 발생했습니다.");
            setIsDeleting(false);
        }
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">숙소 상세: {accommodation.name}</h1>

      <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold mb-3 border-b pb-2">기본 정보</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
          <div><b>ID:</b> {accommodation.accommodationId}</div>
          <div><b>Partner ID:</b> {partnerPk ?? "-"}</div>
          <div><b>유형:</b> {accommodation.accommodationType}</div>
          <div><b>평점:</b> {accommodation.ratingAvg ?? "-"} / 5.0</div>
          <div className="md:col-span-2"><b>설명:</b> {accommodation.description ?? "-"}</div>
          <div className="md:col-span-2"><b>주소:</b> {accommodation.address} ({accommodation.city ?? "-"})</div>
          <div><b>체크인:</b> {accommodation.checkinTime ?? "-"}</div>
          <div><b>체크아웃:</b> {accommodation.checkoutTime ?? "-"}</div>
        </div>

        <div className="pt-6 mt-6 border-t border-gray-200">
          <h2 className="text-xl font-semibold mb-3">편의시설</h2>
          {accommodation.amenities && accommodation.amenities.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {accommodation.amenities.map(amenity => (
                <span key={amenity.amenityId} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {amenity.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">등록된 편의시설이 없습니다.</p>
          )}
        </div>

        <div className="mt-8 border-t pt-6 flex justify-end space-x-3">
          <button 
            onClick={() => navigate(`/partner/accommodations/${id}/edit`)} 
            disabled={isDeleting} // 삭제 중 비활성화
            className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition ${isDeleting ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            정보 수정
          </button>
          
          <button 
            onClick={handleDelete}
            disabled={isDeleting} // 삭제 중 비활성화
            className={`px-4 py-2 border border-red-500 text-red-600 rounded hover:bg-red-50 transition ${isDeleting ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isDeleting ? "삭제 중..." : "숙소 삭제"}
          </button>

          <Link 
            to="/partner/accommodations" 
            onClick={(e) => {
              if (isDeleting) e.preventDefault();
            }}
            className={`px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition ${isDeleting ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
          > 
            목록으로
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AccommodationDetailPage;