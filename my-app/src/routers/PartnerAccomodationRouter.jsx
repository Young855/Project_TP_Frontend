import { redirect } from "react-router-dom"; 

// 컴포넌트 Import
import PartnerAccommodationPage from "../pages/partnerAccomodation/PartnerAccommodationPage";
import AccommodationCreate from "../pages/partnerAccomodation/AccommodationCreate";
import AccommodationDetail from "../pages/partnerAccomodation/AccommodationDetail";
import AccommodationEdit from "../pages/partnerAccomodation/AccommodationEdit";
import { 
    getAccommodation, 
    createAccommodation, 
    updateAccommodation, 
    deleteAccommodation 
} from "../api/accommodationAPI"; 
import PhotoList from "../pages/photo/PhotoList";
import PhotoCreate from "../pages/photo/PhotoCreate";

// Loader
const accommodationLoader = async ({ params }) => {
    const accommodation = await getAccommodation(params.id);
    return { accommodation }; 
};

// Actions
const accommodationCreateAction = async ({ request }) => {
    const formData = await request.formData();
    
    const amenityNamesString = formData.get('amenityNames');
    formData.delete('amenityNames');
    
    const data = Object.fromEntries(formData);
    
    if (amenityNamesString) {
        data.amenityNames = amenityNamesString.split(',').filter(Boolean);
    } else {
        data.amenityNames = []; 
    }
    
    try {
        const newAccommodation = await createAccommodation(data);
        return redirect(`/partner/accommodations/${newAccommodation.accommodationId}`);
    } catch (error) {
        console.error("숙소 등록 실패:", error);
        return { error: '숙소 등록에 실패했습니다. 입력값을 확인해주세요.' };
    }
};

const accommodationEditAction = async ({ params, request }) => {
    const formData = await request.formData();
    const amenityNamesString = formData.get('amenityNames');
    formData.delete('amenityNames'); 

    const data = Object.fromEntries(formData);
    if (amenityNamesString) {
        data.amenityNames = amenityNamesString.split(',').filter(Boolean);
    } else {
        data.amenityNames = [];
    }
    
    try {
        await updateAccommodation(params.id, data);
        return redirect(`/partner/accommodations/${params.id}`);
    } catch (error) {
        console.error("숙소 수정 실패:", error);
        return { error: '숙소 수정에 실패했습니다.' };
    }
};

const accommodationDeleteAction = async ({ params }) => {
    try {
        await deleteAccommodation(params.id);
        return redirect('/partner/accommodations'); 
    } catch (error) {
        console.error("숙소 삭제 실패:", error);
        return { error: '숙소 삭제에 실패했습니다.' };
    }
};

// [수정] 변수명 정의
export const accommodationRoutes = [
    {
        path: "accommodations", 
        children: [
            {
                index: true, 
                element: <PartnerAccommodationPage />, 
            },
            {
                path: "new", 
                element: <AccommodationCreate />, 
                action: accommodationCreateAction, 
            },
            {
                path: ":id", 
                element: <AccommodationDetail />, 
                loader: accommodationLoader, 
            },
            {
                path: ":id/edit", 
                element: <AccommodationEdit />, 
                loader: accommodationLoader, 
                action: accommodationEditAction, 
            },
             {
                path: ":id/delete",
                action: accommodationDeleteAction, 
            },
             {
                path: "photos/:accommodationId",
                element: <PhotoList type="ACCOMMODATION" />
            },
            {
                path: "photos/:accommodationId/new", // /partner/accommodations/photos/1/new
                element: <PhotoCreate type="ACCOMMODATION" />
            }
        ],
    },
];

// [수정] 위에서 정의한 accommodationRoutes를 그대로 export default 합니다.
export default accommodationRoutes;