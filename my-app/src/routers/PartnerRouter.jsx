import PartnerLoginPage from "../pages/partner/PartnerLoginPage";
import BizVerificationPage from "../pages/partner/BizVerificationPage";
import EmailVerificationPage from "../pages/user/EmailVarificationPage"; 
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
            {
                path : "bizverification",
                element: <BizVerificationPage/>
            },
            {
                path : "email-verification", 
                element: <EmailVerificationPage type="partner" />
            },
        ],
    },
];

export default PartnerRouter;