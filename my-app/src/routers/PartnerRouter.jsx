import PartnerLoginPage from "../pages/partner/PartnerLoginPage";
import PartnerSignupPage from "../pages/partner/partnerSignupPage";
import BizVerificationPage from "../pages/partner/BizVerificationPage";

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
            {
                path : "bizverification",
                element: <BizVerificationPage/>
            },

        ],
    },
];

export default PartnerRouter;