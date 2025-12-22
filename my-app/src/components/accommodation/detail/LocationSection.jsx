// 위치 섹션
import { MdLocationOn } from "react-icons/md";

export default function LocationSection({
  locationRef,
  locationTitleRef,
  address,
  city,
}) {
  return (
    <section ref={locationRef} className="mt-6 space-y-3 px-1 scroll-mt-28">
      <h2 ref={locationTitleRef} className="text-xl font-semibold scroll-mt-40">
        위치
      </h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-sm text-gray-700 space-y-2">
        <div className="flex items-start gap-2">
          <MdLocationOn className="mt-0.5 text-gray-500" />
          <div>
            <div>{address}</div>
            {city && <div className="text-gray-500">({city})</div>}
          </div>
        </div>
      </div>
    </section>
  );
}
