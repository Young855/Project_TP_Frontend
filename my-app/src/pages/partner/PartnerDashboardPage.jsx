import { useNavigate, useOutletContext } from 'react-router-dom';
import { Home, Bed, Calendar, MessageSquare, ListPlus, Edit } from 'lucide-react';

export default function PartnerDashboardPage() {
  const navigate = useNavigate();
  const { showModal } = useOutletContext(); 
  const dashboardActions = [
    { 
      id: 1, 
      name: '내 숙소 관리', 
      description: '등록된 숙소의 상세 정보 수정 및 삭제', 
      icon: Home, 
      path: '/partner/properties'
    },
    { 
      id: 2, 
      name: '새 숙소 등록', 
      description: '새로운 숙소 정보를 등록합니다.', 
      icon: ListPlus, 
      path: '/properties/new'
    },
    { 
      id: 3, 
      name: '예약 현황 확인', 
      description: '기간별, 숙소별 예약 및 매출 현황을 확인합니다.', 
      icon: Calendar, 
      path: '/partner/bookings' 
    },
    { 
      id: 4, 
      name: '리뷰 관리 및 답변', 
      description: '사용자 리뷰 열람 및 답변을 등록합니다.', 
      icon: MessageSquare, 
      path: '/partner/reviews' 
    },
    { 
      id: 5, 
      name: '파트너 정보 수정', 
      description: '사업자 정보 및 계정 정보를 수정합니다.', 
      icon: Edit, 
      path: '/partner/profile/edit' 
    },
  ];
  const handleActionClick = (action) => {
    if (action.path) {
      navigate(action.path);
    } else {
      showModal('기능 준비 중', `${action.name} 기능은 현재 준비 중입니다.`, null);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">파트너 대시보드</h1>
        <p className="text-gray-600 mb-8">호텔 관리자 페이지에 오신 것을 환영합니다. 주요 업무를 선택해주세요.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardActions.map((action) => {
            const IconComponent = action.icon; 
            return (
              <div 
                key={action.id}
                onClick={() => handleActionClick(action)}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300 cursor-pointer border-t-4 border-amber-500 hover:border-amber-600"
              >
                <div className="flex items-center space-x-4">
                  <IconComponent size={32} className="text-amber-600 flex-shrink-0" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">{action.name}</h2>
                    <p className="text-sm text-gray-500 mt-1">{action.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/*  */}
        
        <div className="mt-10 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">파트너 가이드</h3>
            <p className="text-blue-700 text-sm">
                숙소 등록 및 관리는 <span className="font-bold">내 숙소 관리</span> 메뉴에서 시작합니다. 객실 등록 및 수정은 숙소 관리 내부의 <span className="font-bold">객실 관리</span> 모달을 통해 진행할 수 있습니다.
            </p>
        </div>
    </div>
  );
}