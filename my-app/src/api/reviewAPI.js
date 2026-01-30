import axios from "axios";
import { REVIEW_ENDPOINTS, axiosConfig } from "@/config";

export const getReviewList = async (accommodationId, page = 0, size = 10) => {
    try {
        const response = await axios.get(REVIEW_ENDPOINTS.REVIEWS.LIST, {
            ...axiosConfig,
            params: {
                accommodationId,
                page,
                size
            }
        });
        return response.data;
    } catch (error) {
        console.error("Review fetch error:", error);
        throw error;
    }
};