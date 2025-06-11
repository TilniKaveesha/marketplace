import { AllListingPayloadType, ListingType, LoginType, RegisterType } from '@/@types/api.types';
import axios from 'axios';

export const RegisterMutationFn = async (data: RegisterType)=>
    await axios.post("/api/register",data)

export const loginMutationFn = async (data: LoginType)=>
    await axios.post("/api/login",data)

export const logoutMutationFn = async () => await axios.post("/api/logout");

export const getCurrentUserQueryFn= async()=>{
    const response = await axios.get("/api/current-user");
    return response.data;
};

export const addListingMutationFn = async (data: ListingType)=>
    await axios.post("/api/add-listing",data)

export const getAllListingQueryFn = async ({
    category,
    condition,
    price,
    model,
    type,
    keyword

}:AllListingPayloadType) => {
    const baseUrl=`/api/listing`; 
    
    const queryParams =new URLSearchParams();
    if(category && category.length!==0) queryParams.append("category",category.join(","));
    if(condition && condition.length!==0) queryParams.append("condition",condition.join(","));
    if(price) queryParams.append("price",price);
    if(model && model.length!==0) queryParams.append("model",model.join(","));
    if(type && type.length!==0) queryParams.append("type",type.join(","));
    if(keyword) queryParams.append("keyword",keyword);
    
    const url = queryParams.toString() ? `${baseUrl}?${queryParams}` : baseUrl;
  const response = await axios.get(url);
  return response.data;

};

//get single listing
export const getSingleListingQueryFn = async (listingId: string) => {
  const response = await axios.get(`/api/listing/${listingId}`);
  return response.data;
};


//Get Myshop and Listing
export const getMyShopQueryFn = async () => {
    const response =await axios.get("/api/shop/my-shop");
    return response.data;
};

// Get Shop by shopId
export const getShopByIdQueryFn = async (shopId: string) => {
  console.log(shopId);
  const response = await axios.get(`/api/shop/${shopId}`);
  return response.data;
};