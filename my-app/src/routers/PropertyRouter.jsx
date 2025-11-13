import { redirect } from "react-router-dom"; 

import { updatePropertyAmenities } from "../api/propertyamenityAPI";
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

// --- Loader ---
const propertyLoader = async ({ params }) => {
    const property = await getProperty(params.id);
    return { property };
};

const propertyCreateAction = async ({ request }) => {
    const formData = await request.formData();
    const amenityIdsString = formData.get('amenityIds');
    formData.delete('amenityIds');
    const data = Object.fromEntries(formData);
    console.log('1. 폼에서 받은 원본 데이터:', data);
    
    try {
        const newProperty = await createProperty(data);
        if (amenityIdsString) {
            const amenityIds = amenityIdsString.split(',')
                                .filter(Boolean)
                                .map(Number);
            
            if (amenityIds.length > 0) {
                await updatePropertyAmenities(newProperty.propertyId, amenityIds);
            }
        }
        
        return redirect(`/partner/properties/${newProperty.propertyId}`);
    } catch (error) {
        console.error("숙소 등록 실패:", error);
        return { error: '숙소 등록에 실패했습니다. 입력값을 확인해주세요.' };
    }
};

const propertyEditAction = async ({ params, request }) => {
    const formData = await request.formData();
    const amenityIdsString = formData.get('amenityIds');
    formData.delete('amenityIds'); // 숙소 수정 데이터에는 포함되지 않도록 제거

    const data = Object.fromEntries(formData);
    
    try {
        await updateProperty(params.id, data);
        const amenityIds = amenityIdsString 
            ? amenityIdsString.split(',').filter(Boolean).map(Number)
            : [];
        await updatePropertyAmenities(params.id, amenityIds);

        return redirect(`/partner/properties/${params.id}`);
    } catch (error) {
        console.error("숙소 수정 실패:", error);
        return { error: '숙소 수정에 실패했습니다.' };
    }
};

const propertyDeleteAction = async ({ params }) => {
    try {
        await deleteProperty(params.id);
        return redirect('/partner/properties');
    } catch (error) {
        console.error("숙소 삭제 실패:", error);
        return { error: '숙소 삭제에 실패했습니다.' };
    }
};
export const propertyRoutes = [
    {
        path: "partner/properties",
        children: [
            {
                index: true, 
                element: <PartnerPropertiesPage />,
            },
            {
                path: "new", 
                element: <PropertyCreate />, 
                action: propertyCreateAction, // 수정된 action 연결
            },
            {
                path: ":id", 
                element: <PropertyDetail />, 
                loader: propertyLoader, // loader 연결
            },
            {
                path: ":id/edit", 
                element: <PropertyEdit />, 
                loader: propertyLoader, // loader 연결
                action: propertyEditAction, // 수정된 action 연결
            },
             {
                path: ":id/delete",
                action: propertyDeleteAction, // action 연결
            },
        ],
    },
    
];

export default propertyRoutes;