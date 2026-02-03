import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getRoom, deleteRoom , checkActiveBookings} from "../../api/roomAPI";
import { getRoomPhotoBlobUrl } from "../../api/roomPhotoAPI"; // 🌟 사진 URL 헬퍼 함수
import { 
  Users, Maximize, Home, Bath, Bed, Package, 
  Info, CheckCircle, XCircle, ArrowLeft, Edit, Trash2,
  Box, Layers, Image as ImageIcon
} from 'lucide-react';

const RoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  // 데이터 로드
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setErrMsg("");
        const data = await getRoom(id);
        setItem(data);
      } catch (e) {
        console.error(e);
        setErrMsg("객실 상세 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // 삭제 핸들러
  const onDelete = async () => {
    if (!window.confirm("정말 이 객실을 삭제하시겠습니까? 삭제 후에는 되돌릴 수 없습니다.")) return;

    try {
      // 1. 예약 있는지 먼저 확인 (GET 요청)
      const hasBookings = await checkActiveBookings(id);

      if (hasBookings) {
        // 2. 예약이 있으면 경고만 띄우고 중단 (에러 아님)
        alert("해당 객실에 아직 종료되지 않은 예약이 있어 삭제할 수 없습니다.");
        return;
      }

      // 3. 예약이 없으면 진짜 삭제 진행 (PUT 요청)
      await deleteRoom(id);
      
      alert("객실이 삭제되었습니다.");
      navigate("/partner/accommodations"); // 혹은 목록 페이지 경로

    } catch (e) {
      console.error(e);
      alert("삭제 처리 중 오류가 발생했습니다.");
    }
  };

  // 로딩 및 에러 처리
  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
  if (errMsg) return <div className="p-8 text-center text-red-600 font-bold">{errMsg}</div>;
  if (!item) return <div className="p-8 text-center text-gray-500">객실 데이터가 없습니다.</div>;

  // 🌟 [핵심] 대표 이미지 찾기 (isMain이 true인 것, 없으면 첫 번째)
  const mainPhoto = item.photos?.find(p => p.isMain) || item.photos?.[0];

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl">
      {/* 1. 상단 헤더 (뒤로가기, 타이틀, 액션 버튼) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate("/partner/rooms")} 
            className="p-2 hover:bg-gray-100 rounded-full transition"
            title="목록으로"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
             <span className="text-sm text-gray-500 font-medium block">
                {item.accommodationName || "숙소명 미확인"}
             </span>
             <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                {item.name}
             </h1>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => navigate(`/partner/rooms/${id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
          >
            <Edit className="w-4 h-4" /> 정보 수정
          </button>
          <button 
            onClick={onDelete}
            className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition font-medium shadow-sm"
          >
            <Trash2 className="w-4 h-4" /> 객실 삭제
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. 좌측: 이미지 및 핵심 요약 카드 */}
        <div className="lg:col-span-1 space-y-6">
          {/* 이미지 영역 */}
          <div className="bg-gray-100 rounded-xl overflow-hidden shadow-sm aspect-video relative border border-gray-200 group">
             {mainPhoto ? (
               <img 
                 src={getRoomPhotoBlobUrl(mainPhoto.imageId)} 
                 alt={item.name}
                 className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
               />
             ) : (
               <div className="flex flex-col items-center justify-center h-full text-gray-400">
                 <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                 <span>이미지 없음</span>
               </div>
             )}
             
             {/* 이미지 관리 버튼 (오버레이) */}
             <button 
                onClick={() => navigate(`/partner/rooms/photos/${id}`)}
                className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full hover:bg-black/80 transition backdrop-blur-sm flex items-center gap-1"
             >
                <ImageIcon className="w-3 h-3" />
                사진 관리 ({item.photos?.length || 0})
             </button>
          </div>

          {/* 핵심 상태 카드 */}
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
             <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">객실 상태 요약</h3>
             <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                   <span className="text-gray-600">환불 정책</span>
                   {item.refundable ? (
                     <span className="flex items-center gap-1 text-green-700 font-bold bg-green-50 px-2 py-1 rounded text-xs">
                       <CheckCircle className="w-3.5 h-3.5" /> 환불 가능
                     </span>
                   ) : (
                     <span className="flex items-center gap-1 text-red-700 font-bold bg-red-50 px-2 py-1 rounded text-xs">
                       <XCircle className="w-3.5 h-3.5" /> 환불 불가
                     </span>
                   )}
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                   <span className="text-gray-600">총 재고량</span>
                   <span className="font-bold text-gray-900">{item.totalStock}개</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-gray-600">등록일</span>
                   <span className="text-gray-900 text-sm">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}
                   </span>
                </div>
             </div>
          </div>
        </div>

        {/* 3. 우측: 상세 정보 */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 스펙 그리드 */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
             <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-500" /> 기본 스펙
             </h2>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center hover:bg-blue-50 transition">
                   <Users className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                   <div className="text-xs text-gray-500 mb-1">기준/최대 인원</div>
                   <div className="font-bold text-gray-900">{item.standardCapacity}명 / {item.maxCapacity}명</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center hover:bg-blue-50 transition">
                   <Maximize className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                   <div className="text-xs text-gray-500 mb-1">객실 크기</div>
                   <div className="font-bold text-gray-900">{item.areaSquareMeter}m²</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center hover:bg-blue-50 transition">
                   <Box className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                   <div className="text-xs text-gray-500 mb-1">객실 구성</div>
                   <div className="font-bold text-gray-900">{item.roomCount}실</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center hover:bg-blue-50 transition">
                   <div className="flex justify-center gap-3 mb-2">
                      <div className="flex flex-col items-center">
                        <Bath className="w-5 h-5 text-gray-400" />
                        <span className="text-[10px] font-bold mt-1">{item.bathroomCount}</span>
                      </div>
                      <div className="flex flex-col items-center pl-3 border-l border-gray-300">
                        <Home className="w-5 h-5 text-gray-400" />
                        <span className="text-[10px] font-bold mt-1">{item.livingRoomCount}</span>
                      </div>
                   </div>
                   <div className="text-xs text-gray-500">욕실 / 거실</div>
                </div>
             </div>
          </div>

          {/* 침대 및 패키지 정보 */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
             <div className="grid md:grid-cols-2 gap-8">
                <div>
                   <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Bed className="w-5 h-5 text-indigo-500" /> 침대 구성
                   </h2>
                   {item.bedTypes && item.bedTypes.length > 0 ? (
                     <ul className="space-y-2">
                        {item.bedTypes.map((bed, idx) => (
                           <li key={idx} className="flex items-center gap-2 text-gray-700 bg-indigo-50 px-3 py-2 rounded-lg text-sm font-medium">
                              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                              {bed}
                           </li>
                        ))}
                     </ul>
                   ) : (
                     <p className="text-gray-400 text-sm">등록된 침대 정보가 없습니다.</p>
                   )}
                </div>
                <div>
                   <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Package className="w-5 h-5 text-green-500" /> 패키지 포함 내역
                   </h2>
                   <div className="flex items-center bg-green-50 p-4 rounded-lg border border-green-100 h-1.5">
                      <p className="text-green-800 font-medium whitespace-pre-wrap">
                         {item.packageDescription || "포함 내역 없음"}
                      </p>
                   </div>
                </div>
             </div>
          </div>

          {/* 편의시설 및 정책 */}
          <div className="grid md:grid-cols-2 gap-6">
             {/* 편의시설 */}
             <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                   <Box className="w-5 h-5 text-purple-500" /> 편의시설
                </h2>
                {item.amenities && item.amenities.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                     {item.amenities.map((amenity, idx) => (
                        <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-200">
                           {amenity}
                        </span>
                     ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">등록된 편의시설이 없습니다.</p>
                )}
             </div>

             {/* 이용 정책 */}
             <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                   <Info className="w-5 h-5 text-red-500" /> 이용 정책
                </h2>
                {item.policies && item.policies.length > 0 ? (
                  <ul className="space-y-2">
                     {item.policies.map((policy, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                           <CheckCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                           {policy}
                        </li>
                     ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 text-sm">등록된 정책이 없습니다.</p>
                )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RoomDetail;