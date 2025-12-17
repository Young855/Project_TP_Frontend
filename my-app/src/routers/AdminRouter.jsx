import List from "../pages/admin/accommodation/List";
import AdminAccountList from "../pages/admin/AdminAccountList";


const AdminRouter = [
    {
        path: "accommodations", // /admin/accommodations 경로로 매핑됨
        element: <List />
    },
    {
        path: "accounts",       // 🌟 [추가] URL: /admin/accounts
        element: <AdminAccountList />
    }
];

export default AdminRouter;