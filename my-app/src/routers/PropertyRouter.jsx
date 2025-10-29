import React from "react";
import PropertyList from "../pages/property/PropertyList";
import PropertyCreate from "../pages/property/PropertyCreate";
import PropertyDetail from "../pages/property/PropertyDetail";
import PropertyEdit from "../pages/property/PropertyEdit";

/**
 * PropertyRouter
 * base path: /properties
 */
const PropertyRouter = [
  {
    path: "properties",
    children: [
      { index: true, element: <PropertyList /> },       // /properties
      { path: "create", element: <PropertyCreate /> },  // /properties/create
      { path: ":id", element: <PropertyDetail /> },     // /properties/:id
      { path: ":id/edit", element: <PropertyEdit /> },  // /properties/:id/edit
    ],
  },
];

export default PropertyRouter;
