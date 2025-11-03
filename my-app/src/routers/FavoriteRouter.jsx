import FavoriteList from "../pages/favorite/FavoriteList";
import FavoriteCreate from "../pages/favorite/FavoriteCreate";
import FavoriteDetail from "../pages/favorite/FavoriteDetail";
import FavoriteEdit from "../pages/favorite/FavoriteEdit";

const FavoriteRouter = [
  {
    path: "favorite",
    children: [
      {
        index: true,
        element: <FavoriteList />,
      },
      {
        path: "create",
        element: <FavoriteCreate />,
      },
      {
        path: ":id",
        element: <FavoriteDetail />,
      },
      {
        path:":id/edit",
        element: <FavoriteEdit />
      },
    ],
  },
];

export default FavoriteRouter;