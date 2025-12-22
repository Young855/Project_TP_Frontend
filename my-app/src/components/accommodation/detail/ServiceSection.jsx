// 서비스 및 부대시설 섹션
export default function ServiceSection({
  servicesRef,
  servicesTitleRef,
  amenities = [],
  onOpenModal,
}) {
  return (
    <section ref={servicesRef} className="mt-6 space-y-3 px-1 scroll-mt-28">
      <div className="flex items-center justify-between">
        <h2
          ref={servicesTitleRef}
          className="text-xl font-semibold scroll-mt-40"
        >
          서비스 및 부대시설
        </h2>

        <button
          type="button"
          onClick={onOpenModal}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          전체보기
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        {Array.isArray(amenities) && amenities.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {amenities.slice(0, 8).map((a) => (
              <div
                key={a.amenityId || a.name}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <span>{a.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">등록된 편의시설이 없습니다.</p>
        )}
      </div>
    </section>
  );
}
