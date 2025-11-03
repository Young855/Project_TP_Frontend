import ItineraryList from "../pages/itinerary/ItineraryList";
import ItineraryCreate from "../pages/itinerary/ItineraryCreate";
import ItineraryDetail from "../pages/itinerary/ItineraryDetail";
import ItineraryEdit from "../pages/itinerary/ItineraryEdit";

const ItineraryRouter = [
  {
    path: "itineraries", // 기본 경로: /itineraries
    children: [
      {
        index: true,               // /itineraries
        element: <ItineraryList /> // 전체 일정 목록
      },
      {
        path: "create",            // /itineraries/create
        element: <ItineraryCreate /> // 일정 생성
      },
      {
        path: ":id",               // /itineraries/:id
        element: <ItineraryDetail /> // 일정 상세
      },
      {
        path: ":id/edit",          // /itineraries/:id/edit
        element: <ItineraryEdit />   // 일정 수정
      },
    ],
  },
];

export default ItineraryRouter;
