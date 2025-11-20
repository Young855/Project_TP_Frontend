import React from 'react';
import { TrendingUp, Users, BedDouble, AlertCircle } from 'lucide-react';

const StatCard = ({ title, value, subValue, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        <p className={`text-xs mt-2 ${subValue.includes('+') ? 'text-green-500' : 'text-red-500'}`}>
          {subValue}
        </p>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  </div>
);

const PartnerDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="오늘의 매출" 
          value="₩ 1,250,000" 
          subValue="+12.5% vs 어제" 
          icon={TrendingUp} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="체크인 예정" 
          value="8 건" 
          subValue="현재 3건 완료" 
          icon={Users} 
          color="bg-indigo-500" 
        />
        <StatCard 
          title="남은 객실" 
          value="12 / 40" 
          subValue="점유율 70%" 
          icon={BedDouble} 
          color="bg-emerald-500" 
        />
        <StatCard 
          title="확정 대기" 
          value="2 건" 
          subValue="즉시 확인 필요" 
          icon={AlertCircle} 
          color="bg-orange-500" 
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">최근 들어온 예약</h3>
          <button className="text-sm text-blue-600 hover:underline">전체보기</button>
        </div>
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm">
                    <th className="p-4 font-medium">예약번호</th>
                    <th className="p-4 font-medium">게스트</th>
                    <th className="p-4 font-medium">체크인/아웃</th>
                    <th className="p-4 font-medium">객실타입</th>
                    <th className="p-4 font-medium">상태</th>
                    <th className="p-4 font-medium text-right">금액</th>
                </tr>
            </thead>
            <tbody className="text-sm">
                <tr className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="p-4">#BK-20251101</td>
                    <td className="p-4 font-medium">김철수</td>
                    <td className="p-4 text-gray-500">25.11.20 - 11.22</td>
                    <td className="p-4">디럭스 오션뷰</td>
                    <td className="p-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">확정됨</span></td>
                    <td className="p-4 text-right">₩ 350,000</td>
                </tr>
                <tr className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="p-4">#BK-20251102</td>
                    <td className="p-4 font-medium">Jane Doe</td>
                    <td className="p-4 text-gray-500">25.12.01 - 12.03</td>
                    <td className="p-4">스탠다드 더블</td>
                    <td className="p-4"><span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">대기중</span></td>
                    <td className="p-4 text-right">₩ 180,000</td>
                </tr>
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default PartnerDashboard;