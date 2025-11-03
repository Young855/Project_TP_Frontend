import ItineraryItemList from "../pages/itinerary/ItineraryItemList";
import ItineraryItemCreate from "../pages/itinerary/ItineraryItemCreate";
import ItineraryItemDetail from "../pages/itinerary/ItineraryItemDetail";
import ItineraryItemEdit from "../pages/itinerary/ItineraryItemEdit";

const ItineraryRouter = [
  {
    path: "itinerary-items", // 기본 경로: /itinerary-items
    children: [
      {
        index: true, // /itinerary-items
        element: <ItineraryItemList />, // 전체 일정 항목 목록
      },
      {
        path: "create", // /itinerary-items/create
        element: <ItineraryItemCreate />, // 일정 항목 등록
      },
      {
        path: ":id", // /itinerary-items/:id
        element: <ItineraryItemDetail />, // 단일 일정 항목 상세보기
      },
      {
        path: ":id/edit", // /itinerary-items/:id/edit
        element: <ItineraryItemEdit />, // 일정 항목 수정
      },
    ],
  },
];

export default ItineraryRouter;
