import { redirect } from "react-router-dom"; 
      
import UserEdit from "../pages/user/UserEdit";       
import SignupPage from "../pages/user/SignupPage";   
import LoginPage from "../pages/user/LoginPage";     
import MyPage from "../pages/user/MyPage";


import { 
    getUser, 
    createUser, 
    updateUser, 
    deleteUser,
    getAllUsers 
} from "../api/userAPI"; 
import EmailVerificationPage from "../pages/user/EmailVarificationPage";

const userListLoader = async () => {
    try {
        const users = await getAllUsers();
        return { users }; 
    } catch (error) {
        console.error("사용자 목록 로드 실패:", error);
        return { error: '사용자 목록을 불러올 수 없습니다.' }; 
    }
};

const userLoader = async ({ params }) => {
    try {
        const user = await getUser(params.id);
        return { user };
    } catch (error) {
        console.error(`사용자 ${params.id} 로드 실패:`, error);
        return { error: '사용자 정보를 찾을 수 없습니다.' }; 
    }
};

const userSignupAction = async ({ request }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    
    const userData = {
        ...data,
        password: data.password,
        role: 'ROLE_USER',
    };

    try {
        await createUser(userData);
        return redirect('/user/login'); 
    } catch (error) {
        console.error("사용자 가입 실패:", error);
        return { error: error.response?.data?.message || '가입에 실패했습니다.' }; 
    }
};

const userEditAction = async ({ params, request }) => {
    const formData = await request.formData();
    const body = Object.fromEntries(formData);
    
    if (!body.password) {
        delete body.password;
    }

    try {
        await updateUser(params.id, body);
        return redirect(`/user/${params.id}`); 
    } catch (error) {
        console.error("사용자 수정 실패:", error);
        return { 
            error: error.response?.data?.message || (error.response?.status === 409 ? "이메일 또는 닉네임이 이미 존재합니다." : "유저 수정에 실패했습니다.") 
        }; 
    }
};

const userDeleteAction = async ({ params }) => {
    try {
        await deleteUser(params.id);
        return redirect('/user'); 
    } catch (error) {
        console.error("사용자 삭제 실패:", error);
        return { error: '삭제에 실패했습니다.' }; 
    }
};
export const userRoutes = [
    {
        path: "user", 
        children: [
            {
                path: "signup", 
                element: <SignupPage />, 
                action: userSignupAction, 
            },
            { 
                // [수정] type props 전달
                path: "email-verification", 
                element: <EmailVerificationPage type="signup" />,
            },
            {
                path: "login", 
                element: <LoginPage/>, 
            },
            {
                path: "mypage", 
                element: <MyPage />, 
            },
            {
                path: ":id/edit", 
                element: <UserEdit />, 
                loader: userLoader, 
                action: userEditAction, 
            },
            {
                path: ":id/delete",
                action: userDeleteAction, 
            },
        ],
    },
];

export default userRoutes;