// --- Mock Data ---
// 실제 애플리케이션에서는 이 데이터를 API로부터 받아옵니다.
export const mockAccommodations = [
  {
    id: 1,
    title: '제주 신라 호텔',
    location: '제주 서귀포시',
    price: 350000,
    rating: 4.8,
    reviewCount: 1200,
    imageUrl: 'https://placehold.co/600x400/000000/FFFFFF?text=Shilla+Jeju'
  },
  {
    id: 2,
    title: '부산 파라다이스 호텔',
    location: '부산 해운대구',
    price: 280000,
    rating: 4.7,
    reviewCount: 980,
    imageUrl: 'https://placehold.co/600x400/3498DB/FFFFFF?text=Paradise+Busan'
  },
  {
    id: 3,
    title: '서울 포시즌스 호텔',
    location: '서울 종로구',
    price: 450000,
    rating: 4.9,
    reviewCount: 850,
    imageUrl: 'https://placehold.co/600x400/E74C3C/FFFFFF?text=Four+Seasons'
  },
  {
    id: 4,
    title: '강릉 씨마크 호텔',
    location: '강원 강릉시',
    price: 310000,
    rating: 4.6,
    reviewCount: 760,
    imageUrl: 'https://placehold.co/600x400/2ECC71/FFFFFF?text=Seamarq+Hotel'
  }
];

export const mockUser = {
  nickname: '여행조아',
  name: '김여행',
  email: 'travel@example.com',
  birthDate: '1995-10-20',
  phone: '010-1234-5678'
};

export const mockBookings = [
  {
    id: 'BK12345',
    accommodation: '제주 신라 호텔',
    checkin: '2025-11-10',
    checkout: '2025-11-12',
    totalAmount: 700000,
    status: 'CONFIRMED',
    paymentStatus: 'PAID'
  },
  {
    id: 'BK12346',
    accommodation: '부산 파라다이스 호텔',
    checkin: '2025-12-05',
    checkout: '2025-12-07',
    totalAmount: 560000,
    status: 'PENDING',
    paymentStatus: 'UNPAID'
  }
];

export const mockItinerary = {
  id: 'ITN001',
  title: '제주 2박 3일 힐링 여행',
  startDate: '2025-11-10',
  endDate: '2025-11-12',
  items: [
    { id: 1, day: 1, time: '14:00', title: '제주 공항 도착', type: 'POI', lat: 33.5104135, lng: 126.4913535 },
    { id: 2, day: 1, time: '15:00', title: '제주 신라 호텔 체크인', type: 'ACCOMMODATION', lat: 33.248564, lng: 126.408066 },
    { id: 3, day: 1, time: '17:00', title: '중문 해수욕장 산책', type: 'POI', lat: 33.242485, lng: 126.413726 },
    { id: 4, day: 2, time: '10:00', title: '오설록 티 뮤지엄', type: 'POI', lat: 33.305481, lng: 126.289726 },
    { id: 5, day: 2, time: '14:00', title: '성산 일출봉', type: 'POI', lat: 33.458056, lng: 126.942500 },
    { id: 6, day: 3, time: '11:00', title: '호텔 체크아웃', type: 'ACCOMMODATION', lat: 33.248564, lng: 126.408066 },
    { id: 7, day: 3, time: '12:00', title: '제주 공항 출발', type: 'POI', lat: 33.5104135, lng: 126.4913535 },
  ]
};