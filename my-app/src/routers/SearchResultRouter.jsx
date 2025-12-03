import SearchResultPage from "../pages/SearchResultPage";

export const searchResultRouter = [
    {
        path: "/search-results", // 이 경로는 검색 결과 페이지에 해당
        children: [
            {
            index: true,
            element: <SearchResultPage />, // 숙소 결과 페이지
            },
        ]
    }
];