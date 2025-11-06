import AccommodationPage from "../pages/accommodation/AccommodationPage";
import AccommodationList from "../pages/accommodation/AccommodationList";
import AccommodationDetail from "../pages/accommodation/AccommodationDetail";
import AccommodationCreate from "../pages/accommodation/AccommodationCreate";
import AccommodationEdit from "../pages/accommodation/AccommodationEdit";


const AccommodationRouter = [
    {
        path: "amenities",
        children:[
            {
                index: true,
                element: <AccommodationList />
            },
            {
                path: "create",
                element: <AccommodationCreate />
            },
            {
                path: ":id",
                element: <AccommodationDetail />
            },
            {
                path: ":id/edit",
                element: <AccommodationEdit />
            },
        ],
    },
];