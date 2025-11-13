import React from "react";
import { useNavigate, useParams, useLoaderData, Form, Link } from "react-router-dom"; 

const PropertyDetailPage = () => {
  const { property } = useLoaderData();
  const { id } = useParams();
  const navigate = useNavigate();

  // [수정] partnerId 접근 방식 (PropertyService.toDTO 기준)
  const partnerPk = property.partnerId; //

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">숙소 상세: {property.name}</h1>

      <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold mb-3 border-b pb-2">기본 정보</h2>
        <div className="grid grid-cols-2 gap-4 text-gray-700">
          <div><b>ID:</b> {property.propertyId}</div>
          <div><b>Partner ID:</b> {partnerPk ?? "-"}</div>
          <div><b>유형:</b> {property.propertyType}</div>
          <div><b>평점:</b> {property.ratingAvg ?? "-"} / 5.0</div>
          <div className="col-span-2"><b>설명:</b> {property.description ?? "-"}</div>
          <div className="col-span-2"><b>주소:</b> {property.address} ({property.city ?? "-"})</div>
          <div><b>체크인:</b> {property.checkinTime ?? "-"}</div>
          <div><b>체크아웃:</b> {property.checkoutTime ?? "-"}</div>
          <div><b>위도/경도:</b> {property.latitude ?? "-"} / {property.longitude ?? "-"}</div>
        </div>

        {/* --- [수정] 편의시설 섹션 --- */}
        <div className="pt-6 mt-6 border-t border-gray-200">
          <h2 className="text-xl font-semibold mb-3">편의시설</h2>
          {/* amenities field added */}
          {property.amenities && property.amenities.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {property.amenities.map(amenity => (
                // index.css에 정의된 .amenity-chip 스타일 사용
                <span key={amenity.amenityId} className="amenity-chip">
                  {amenity.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">등록된 편의시설이 없습니다.</p>
          )}
        </div>
        {/* -------------------------- */}

        <div className="pt-6 mt-6 border-t border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">객실 관리 ({property.rooms?.length || 0}개)</h2>
            <button
              onClick={() => navigate(`/rooms/new?propertyId=${id}`)} // 객실 생성 페이지 라우트 (가정)
              className="btn-primary text-sm px-3 py-1"
            >
              + 객실 추가
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-500 mb-2">객실 목록이 여기에 표시됩니다.</p>
            {property.rooms && property.rooms.length > 0 ? (
                <div>
                    <p>Room 1: 스탠다드, 100,000원 <Link to={`/rooms/${property.rooms[0].roomId}/edit`}>[수정/삭제]</Link></p>
                </div>
            ) : (
                <div className="text-center text-gray-500 py-4">등록된 객실이 없습니다.</div>
            )}
          </div>
        </div>

        <div className="mt-6 border-t pt-4 flex justify-end space-x-2">
          <button 
            onClick={() => navigate(`/partner/properties/${id}/edit`)} // [수정] 경로 수정
            className="btn-primary-outline" // [수정] CSS 클래스 통일
          >
            수정
          </button>
          
          <Form
            method="post"
            action={`/partner/properties/${id}/delete`} // PropertyRouter.jsx의 deleteAction 경로
            onSubmit={(e) => {
              if (!confirm(`숙소 '${property.name}'을(를) 정말 삭제하시겠습니까?`)) e.preventDefault();
            }}
          >
            {/* [수정] CSS 클래스 통일 (btn-secondary-outline + red) */}
            <button className="btn-secondary-outline text-red-600 border-red-600 hover:bg-red-50">
              삭제
            </button>
          </Form>

          {/* [수정] 경로 및 CSS 클래스 통일 */}
          <Link to="/partner/properties" className="btn-secondary-outline"> 
            목록
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailPage;