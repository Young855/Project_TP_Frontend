export default function ServiceModal({ amenities, onClose }) {
  if (!amenities) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold">서비스 및 부대시설</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-black text-2xl">&times;</button>
        </div>
        
        {/* 그리드 컨텐츠 */}
        <div className="p-8 grid grid-cols-4 gap-y-8 gap-x-4 max-h-[70vh] overflow-y-auto">
          {amenities.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center text-center">
              {/* 아이콘: 실제로는 아이콘 매핑 로직 필요, 여기서는 Placeholder */}
              <div className="w-10 h-10 mb-2 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 text-xl">
                 Example
              </div>
              <span className="text-xs text-gray-600 font-medium break-keep">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}