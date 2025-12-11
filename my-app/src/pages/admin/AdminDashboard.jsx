
const AdminDashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">관리자 대시보드</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 통계 카드 예시 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">총 회원 수</h3>
          <p className="text-3xl font-bold">1,234명</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">등록된 숙소</h3>
          <p className="text-3xl font-bold">56개</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">오늘의 예약</h3>
          <p className="text-3xl font-bold">12건</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;