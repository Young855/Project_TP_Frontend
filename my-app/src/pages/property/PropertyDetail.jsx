import React from "react";
import { useNavigate, useParams, useLoaderData, Link } from "react-router-dom"; 
import { deleteProperty } from "../../api/propertyAPI";
import { usePartner } from "../../context/PartnerContext"; // Context Import

const PropertyDetailPage = () => {
  const { property } = useLoaderData();
  const { id } = useParams();
  const navigate = useNavigate();
  
  // [수정] 전역 데이터 갱신 함수 가져오기
  const { refreshPartnerData } = usePartner();

  const partnerPk = property.partnerId; 

  // [수정] Form action 대신 직접 핸들러 구현
  const handleDelete = async () => {
    if (window.confirm(`숙소 '${property.name}'을(를) 정말 삭제하시겠습니까?`)) {
        try {
            // 1. API 삭제 요청
            await deleteProperty(id);
            
            // 2. 전역 컨텍스트 갱신 (중요: 여기서 currentProperty가 null이 됨)
            await refreshPartnerData();
            
            // 3. 목록 페이지로 이동
            navigate('/partner/properties'); 
        } catch (error) {
            console.error(error);
            alert("숙소 삭제 중 오류가 발생했습니다.");
        }
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">숙소 상세: {property.name}</h1>

      <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold mb-3 border-b pb-2">기본 정보</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
          <div><b>ID:</b> {property.propertyId}</div>
          <div><b>Partner ID:</b> {partnerPk ?? "-"}</div>
          <div><b>유형:</b> {property.propertyType}</div>
          <div><b>평점:</b> {property.ratingAvg ?? "-"} / 5.0</div>
          <div className="md:col-span-2"><b>설명:</b> {property.description ?? "-"}</div>
          <div className="md:col-span-2"><b>주소:</b> {property.address} ({property.city ?? "-"})</div>
          <div><b>체크인:</b> {property.checkinTime ?? "-"}</div>
          <div><b>체크아웃:</b> {property.checkoutTime ?? "-"}</div>
        </div>

        <div className="pt-6 mt-6 border-t border-gray-200">
          <h2 className="text-xl font-semibold mb-3">편의시설</h2>
          {property.amenities && property.amenities.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {property.amenities.map(amenity => (
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
            onClick={() => navigate(`/partner/properties/${id}/edit`)} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            정보 수정
          </button>
          
          {/* [수정] Form 태그 제거하고 button onClick으로 변경 */}
          <button 
            onClick={handleDelete}
            className="px-4 py-2 border border-red-500 text-red-600 rounded hover:bg-red-50 transition"
          >
            숙소 삭제
          </button>

          <Link to="/partner/properties" className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition"> 
            목록으로
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailPage;