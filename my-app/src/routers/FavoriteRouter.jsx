import FavoriteDetail from "../pages/favorite/FavoriteDetail";
import FavoriteEdit from "../pages/favorite/FavoriteEdit";
import FavoritePage from "../pages/favorite/FavoritePage";

const FavoriteRouter = [
  {
    path: "favorites",
    children: [
      {
        index: true,
        element: <FavoritePage />,
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