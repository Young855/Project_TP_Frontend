import React from "react";

// 편의 시설 관리에 사용될 페이지 컴포넌트들을 임시로 가정하여 import 합니다.
// 실제 프로젝트 구조에 맞게 경로를 수정해야 합니다.
import AmenityList from "../pages/amenity/AmenityList";
import AmenityCreate from "../pages/amenity/AmenityCreate";
import AmenityDetail from "../pages/amenity/AmenityDetail";
import AmenityEdit from "../pages/amenity/AmenityEdit";

/**
 * AmenityRouter (편의 시설 관리 라우터)
 * React Router v6의 createBrowserRouter 구조를 따릅니다.
 * 기본 경로는 "/amenities" 입니다.
 */
const AmenityRouter = [
    {
        path: "amenities", // /amenities : 시작 경로
        children: [
            {
                index: true,              // index: true -> /amenities 시작 경로로 설정
                element: <AmenityList />  // AmenityList 컴포넌트 매칭
            },
            {
                path: "create",           // /amenities/create : 편의 시설 생성
                element: <AmenityCreate />,
            },
            {
                path: ":id",              // /amenities/:id : 편의 시설 상세 조회. :id -> url로 전송된 id값
                element: <AmenityDetail />,
            },
            { 
                path: ":id/edit",         // /amenities/:id/edit : 편의 시설 수정
                element: <AmenityEdit />
            }
        ] 
    }, 
];

export default AmenityRouter;
