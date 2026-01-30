import ForgotPasswordPage from "../pages/user/ForgotPasswordPage";
import ResetPasswordPage from "../pages/user/ResetPasswordPage";

const AuthRouter = [
    {
        path: "acc",
        children: [
            {
                path: "forgot-password",
                element: <ForgotPasswordPage />,
            },
            {
                path: "reset-password",
                element: <ResetPasswordPage />,
            },
        ],
    },
];

export default AuthRouter;