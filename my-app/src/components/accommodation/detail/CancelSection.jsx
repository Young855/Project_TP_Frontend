// 취소 및 환불 규정 섹션
export default function CancelSection({ cancelRef, cancellationPolicy }) {
  return (
    <section ref={cancelRef} className="mt-6 space-y-3 px-1">
      <h2 className="text-xl font-semibold">취소/환불 규정</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-sm text-gray-700">
        {cancellationPolicy ? (
          <p className="whitespace-pre-line">{cancellationPolicy}</p>
        ) : (
          <p className="text-gray-500">취소/환불 규정이 등록되어 있지 않습니다.</p>
        )}
      </div>
    </section>
  );
}
