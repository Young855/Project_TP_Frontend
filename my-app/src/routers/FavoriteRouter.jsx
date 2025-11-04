import FavoriteList from "../favorite/FavoriteList";
import FavoriteCreate from "../favorite/FavoriteCreate";
import FavoriteDetail from "../favorite/FavoriteDetail";
import FavoriteEdit from "../favorite/FavoriteEdit";

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