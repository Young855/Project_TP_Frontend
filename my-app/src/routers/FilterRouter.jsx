import SearchResultPage from "../pages/SearchResultPage";

const FilterRouter = [
    {
        path: "search",
        children: [ 
        {
            index: true, //search를 메인경로로 한다
            element: <SearchResultPage />


        }
        ]
    }
]

export default FilterRouter;