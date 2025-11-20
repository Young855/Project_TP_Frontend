import { redirect } from "react-router-dom"; 

import PartnerPropertiesPage from "../pages/property/PartnerPropertiesPage";
import PropertyCreate from "../pages/property/PropertyCreate";
import PropertyDetail from "../pages/property/PropertyDetail";
import PropertyEdit from "../pages/property/PropertyEdit";
import { 
    getProperty, 
    createProperty, 
    updateProperty, 
    deleteProperty 
} from "../api/propertyAPI";

const propertyLoader = async ({ params }) => {
    const property = await getProperty(params.id);
    return { property };
};

const propertyCreateAction = async ({ request }) => {
    const formData = await request.formData();
    
    const amenityNamesString = formData.get('amenityNames');
    formData.delete('amenityNames');
    
    const data = Object.fromEntries(formData);
    
    // Amenity 처리 로직
    if (amenityNamesString) {
        data.amenityNames = amenityNamesString.split(',').filter(Boolean);
    } else {
        data.amenityNames = []; 
    }
    
    try {
        // [수정] createProperty 호출 시 partnerId 등 필수 데이터가 폼에 포함되어 있어야 함
        const newProperty = await createProperty(data);
        // 생성 후 상세 페이지로 리다이렉트 (경로는 절대 경로 유지)
        return redirect(`/partner/properties/${newProperty.propertyId}`);
    } catch (error) {
        console.error("숙소 등록 실패:", error);
        return { error: '숙소 등록에 실패했습니다. 입력값을 확인해주세요.' };
    }
};

const propertyEditAction = async ({ params, request }) => {
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
        await updateProperty(params.id, data);
        return redirect(`/partner/properties/${params.id}`);
    } catch (error) {
        console.error("숙소 수정 실패:", error);
        return { error: '숙소 수정에 실패했습니다.' };
    }
};

const propertyDeleteAction = async ({ params }) => {
    try {
        await deleteProperty(params.id);
        return redirect('/partner/properties'); // 삭제 후 목록으로 이동
    } catch (error) {
        console.error("숙소 삭제 실패:", error);
        return { error: '숙소 삭제에 실패했습니다.' };
    }
};

export const propertyRoutes = [
    {
        path: "properties", 
        children: [
            {
                index: true, 
                element: <PartnerPropertiesPage />, // 목록 페이지 (/partner/properties)
            },
            {
                path: "new", 
                element: <PropertyCreate />, // 생성 페이지 (/partner/properties/new)
                action: propertyCreateAction, 
            },
            {
                path: ":id", 
                element: <PropertyDetail />, // 상세 페이지 (/partner/properties/1)
                loader: propertyLoader, 
            },
            {
                path: ":id/edit", 
                element: <PropertyEdit />, // 수정 페이지 (/partner/properties/1/edit)
                loader: propertyLoader, 
                action: propertyEditAction, 
            },
             {
                path: ":id/delete",
                action: propertyDeleteAction, // 삭제 액션
            },
        ],
    },
];

export default propertyRoutes;