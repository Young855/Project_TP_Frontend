// 판매자 정보 섹션
export default function SellerSection({ sellerRef, sellerName, sellerContact }) {
  return (
    <section ref={sellerRef} className="mt-6 space-y-3 px-1">
      <h2 className="text-xl font-semibold">판매자 정보</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-sm text-gray-700 space-y-2">
        {sellerName || sellerContact ? (
          <>
            {sellerName && (
              <div>
                <span className="font-semibold">상호</span>: {sellerName}
              </div>
            )}
            {sellerContact && (
              <div>
                <span className="font-semibold">연락처</span>: {sellerContact}
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-500">판매자 정보가 등록되어 있지 않습니다.</p>
        )}
      </div>
    </section>
  );
}
