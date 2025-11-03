import AmenityList from "../pages/amenity/AmenityList";
import AmenityCreate from "../pages/amenity/AmenityCreate";
import AmenityDetail from "../pages/amenity/AmenityDetail";
import AmenityEdit from "../pages/amenity/AmenityEdit";

const AmenityRouter = [
  {
    path: "amenities", // /amenities
    children: [
      {
        index: true,            // /amenities
        element: <AmenityList />,// 전체 편의시설 목록
      },
      {
        path: "create",         // /amenities/create
        element: <AmenityCreate />,// 편의시설 등록
      },
      {
        path: ":id",            // /amenities/:id
        element: <AmenityDetail />,// 편의시설 상세
      },
      {
        path: ":id/edit",       // /amenities/:id/edit
        element: <AmenityEdit />,// 편의시설 수정
      },
    ],
  },
];

export default AmenityRouter;
