import { Children } from "react";
import FavoriteCreate from "../pages/favorite/FavoriteCreate";
import FavoriteDetail from "../pages/favorite/FavoriteDetail";
import FavoriteList from "../pages/favorite/FavoriteList";
import FavoriteEdit from "../pages/favorite/FavoriteEdit";

const FavoriteRouter = [
  {
    path: "boards",
    children: [
      {
        index: true,
        element: <FavoriteList />
      },
      {
        path: "create",
        element: <FavoriteCreate />
      },
      {
        path: ":id",
        element: <FavoriteDetail />
      },
      {
        path: ":id/edit",
        element: <FavoriteEdit  />
      }
    ]
  },
]

export default FavoriteRouter;