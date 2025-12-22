// "숙소 요약 DTO" 안에서 대표사진 ID를 최대한 유연하게 찾기
export function getRepresentativePhotoId(p) {
  return (
    p?.representPhotoId ??
    p?.mainPhotoId ??
    p?.thumbnailPhotoId ??
    p?.thumbPhotoId ??
    p?.photoId ??
    p?.thumbnailId ??
    null
  );
}

// 사진 메타데이터 리스트에서 대표 사진 1장 ID 고르기
export function pickRepresentativePhotoIdFromMeta(list) {
  if (!Array.isArray(list) || list.length === 0) return null;

  const rep =
    list.find((x) => x?.isRepresentative === true) ||
    list.find((x) => x?.representative === true) ||
    list.find((x) => x?.isRepresent === true) ||
    list.find((x) => x?.represent === true) ||
    list.find((x) => x?.isMain === true) ||
    list.find((x) => x?.main === true) ||
    list.find((x) => x?.isThumbnail === true) ||
    list.find((x) => x?.thumbnail === true) ||
    null;

  const chosen = rep ?? list[0];

  return (
    chosen?.photoId ??
    chosen?.id ??
    chosen?.accommodationPhotoId ??
    chosen?.accommodationPhotoID ??
    chosen?.photo_id ??
    null
  );
}

export function getPriceValue(p) {
  const v = p.minPrice ?? p.pricePerNight ?? p.price ?? p.lowestPrice;
  return typeof v === "number" ? v : null;
}