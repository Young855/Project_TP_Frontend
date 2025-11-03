import HashtagList from "../pages/hashtag/HashtagList";
import HashtagCreate from "../pages/hashtag/HashtagCreate";
import HashtagDetail from "../pages/hashtag/HashtagDetail";
import HashtagEdit from "../pages/hashtag/HashtagEdit";

const HashtagRouter = [
  {
    path: "hashtags", // 기본 경로: /hashtags
    children: [
      {
        index: true, // /hashtags
        element: <HashtagList />, // 전체 해시태그 목록
      },
      {
        path: "create", // /hashtags/create
        element: <HashtagCreate />, // 새 해시태그 등록
      },
      {
        path: ":id", // /hashtags/:id
        element: <HashtagDetail />, // 단일 해시태그 상세
      },
      {
        path: ":id/edit", // /hashtags/:id/edit
        element: <HashtagEdit />, // 해시태그 수정
      },
    ],
  },
];

export default HashtagRouter;
