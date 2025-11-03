import PropertyList from "../pages/property/PropertyList";
import PropertyCreate from "../pages/property/PropertyCreate";
import PropertyDetail from "../pages/property/PropertyDetail";
import PropertyEdit from "../pages/property/PropertyEdit";


/* ------------------------------
   Route objects & provider
--------------------------------*/
export const propertyRoutes = [
  {
    path: "properties", // 기본 경로: /properties
    children: [
      {
        index: true, // /properties
        element: <PropertyList />, // 숙소 목록 페이지
      },
      {
        path: "create", // /properties/create
        element: <PropertyCreate />, // 숙소 등록 페이지
      },
      {
        path: ":id", // /properties/:id
        element: <PropertyDetail />, // 숙소 상세 페이지
      },
      {
        path: ":id/edit", // /properties/:id/edit
        element: <PropertyEdit />, // 숙소 수정 페이지
      },
    ],
  },
];

export default PropertyRouter;
