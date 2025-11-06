import axios from "axios";


const api = axios.create({ baseURL: "/api" });


export const AccommodationAPI = {
// 검색 + 페이지네이션 + 필터
search: async (params) => {
// params: { page, size, types, minPrice, maxPrice, tags, stars, sort }
const { data } = await api.post("/accommodations/search", params);
return data; // PageResponseDTO<AccommodationSummaryDTO>
},


list: async ({ page = 0, size = 12, sort = "id,desc" } = {}) => {
const { data } = await api.get("/accommodations", { params: { page, size, sort } });
return data; // PageResponseDTO<AccommodationSummaryDTO>
},


get: async (id) => {
const { data } = await api.get(`/accommodations/${id}`);
return data; // AccommodationDetailDTO
},


create: async (payload) => {
const { data } = await api.post("/accommodations", payload);
return data; // Long id
},


update: async (id, payload) => {
const { data } = await api.put(`/accommodations/${id}`, payload);
return data; // void
},


remove: async (id) => {
await api.delete(`/accommodations/${id}`);
},
};