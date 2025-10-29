import React from "react";
import FavoriteList from "../pages/favorite/FavoriteList";
import FavoriteCreate from "../pages/favorite/FavoriteCreate";
import FavoriteDetail from "../pages/favorite/FavoriteDetail";
import FavoriteEdit from "../pages/favorite/FavoriteEdit";

/**
 * FavoriteRouter
 * base path: /favorites
 */
const FavoriteRouter = [
  {
    path: "favorites",
    children: [
      { index: true, element: <FavoriteList /> },       // /favorites
      { path: "create", element: <FavoriteCreate /> },  // /favorites/create
      { path: ":id", element: <FavoriteDetail /> },     // /favorites/:id
      { path: ":id/edit", element: <FavoriteEdit /> },  // /favorites/:id/edit (수정 미제공 안내)
    ],
  },
];

export default FavoriteRouter;
