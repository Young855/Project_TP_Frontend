// PropertyRouter.jsx

import React from "react";
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

/* ------------------------------
    Router Loaders and Actions
--------------------------------*/

const propertyLoader = async ({ params }) => {
    const property = await getProperty(params.id); 
    return { property }; 
};

const propertyCreateAction = async ({ request }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    
    try {
        const newProperty = await createProperty(data);
        return redirect(`/properties/${newProperty.propertyId}`); 
    } catch (error) {
        console.error("숙소 등록 실패:", error);
        return { error: '숙소 등록에 실패했습니다. 입력값을 확인해주세요.' }; 
    }
};

const propertyEditAction = async ({ params, request }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    
    try {
        await updateProperty(params.id, data);
        return redirect(`/properties/${params.id}`); 
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


/* ------------------------------
    Route Definition
--------------------------------*/
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
                action: propertyCreateAction, 
            },
            {
                path: ":id", 
                element: <PropertyDetail />, 
                loader: propertyLoader, 
            },
            {
                path: ":id/edit", 
                element: <PropertyEdit />, 
                loader: propertyLoader, 
                action: propertyEditAction, 
            },
             {
                path: ":id/delete",
                action: propertyDeleteAction, 
            },
        ],
    },
    
];

export default propertyRoutes;