import React from "react";
import HashtagList from "../pages/hashtag/HashtagList";
import HashtagCreate from "../pages/hashtag/HashtagCreate";
import HashtagDetail from "../pages/hashtag/HashtagDetail";
import HashtagEdit from "../pages/hashtag/HashtagEdit";

/**
 * HashtagRouter
 * base path: /hashtags
 */
const HashtagRouter = [
  {
    path: "hashtags",
    children: [
      { index: true, element: <HashtagList /> },      // /hashtags
      { path: "create", element: <HashtagCreate /> }, // /hashtags/create
      { path: ":id", element: <HashtagDetail /> },    // /hashtags/:id
      { path: ":id/edit", element: <HashtagEdit /> }, // /hashtags/:id/edit
    ],
  },
];

export default HashtagRouter;
