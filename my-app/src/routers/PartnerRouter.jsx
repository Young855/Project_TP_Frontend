import PartnerLoginPage from "../pages/partner/PartnerLoginPage";
import PartnerSignupPage from "../pages/partner/partnerSignupPage";

const PartnerRouter = [
    {
        path : "partner",
        children: [
            {
                index : true,
                element: ""
            },
            {
                path : "signup",
                element: <PartnerSignupPage/>
            },
            {
                path : "login",
                element: <PartnerLoginPage/>
            },

        ],
    },
];

export default PartnerRouter;