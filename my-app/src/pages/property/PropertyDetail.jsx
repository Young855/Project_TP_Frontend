// 파일: src/pages/property/PropertyDetail.jsx (수정)

import React from "react";
// 💡 [수정] useLoaderData와 Form 임포트
import { useNavigate, useParams, useLoaderData, Form, Link } from "react-router-dom"; 
// import { getProperty, deleteProperty } from "../../api/propertyAPI"; // 이제 loader와 action이 처리

/**
 * 숙소 상세
 * - 데이터는 Router Loader에서 로드됨
 * - Room 관리 섹션 뼈대 포함
 */
const PropertyDetailPage = () => { // 컴포넌트 이름을 페이지 형태로 변경
  // 💡 [수정] loader에서 불러온 데이터 사용
  const { property } = useLoaderData(); 
  const { id } = useParams();
  const navigate = useNavigate();

  const partnerPk = property.partner?.partnerId ?? property.partnerId;

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
            onClick={() => navigate(`/properties/${id}/edit`)}
            className="btn-secondary bg-amber-600 text-white hover:bg-amber-700"
          >
            수정
          </button>
          
          {/* 삭제 버튼 (Form Action 사용 권장) */}
          <Form
            method="post"
            action={`/properties/${id}/delete`} // PropertyRouter.jsx의 deleteAction 경로
            onSubmit={(e) => {
              if (!confirm(`숙소 '${property.name}'을(를) 정말 삭제하시겠습니까?`)) e.preventDefault();
            }}
          >
            <button className="btn-secondary bg-red-600 text-white hover:bg-red-700">
              삭제
            </button>
          </Form>

          {/* 목록 버튼 */}
          <Link to="/property/properties" className="btn-secondary">
            목록
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailPage;