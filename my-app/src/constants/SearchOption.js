export const ACCOMMODATION_TYPE_OPTIONS = [
  { label: "전체", value: "ALL" },
  { label: "호텔", value: "HOTEL" },
  { label: "펜션", value: "PENSION" },
  { label: "게스트하우스", value: "GUESTHOUSE" },
  { label: "리조트", value: "RESORT" },
];

export const SORT_OPTIONS = [
  { label: "추천순", value: "RECOMMENDED" },
  { label: "평점 높은순", value: "RATING_DESC" },
  { label: "리뷰 많은순", value: "REVIEW_DESC" },
  { label: "낮은 가격순", value: "PRICE_ASC" },
  { label: "높은 가격순", value: "PRICE_DESC" },
];

export const HASHTAG_OPTIONS = ["#가족여행숙소", "#스파", "#파티룸", "#OTT"];

export const COMMON_FACILITY_OPTIONS = [
  "사우나", "수영장", "바베큐", "레스토랑", "피트니스", 
  "공용주방", "매점", "조식제공", "무료주차", "반려견동반", 
  "객실내취사", "캠프파이어",
];

export const ROOM_FACILITY_OPTIONS = [
  "스파/월풀", "객실스파", "미니바", "무선인터넷", 
  "에어컨", "욕실용품", "개인금고",
];

export const MIN_PRICE = 0;
export const MAX_PRICE = 500000;
export const PRICE_STEP = 10000;