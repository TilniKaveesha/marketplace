export type LoginType ={
    email:string;
    password:string;
};

export type RegisterType ={
      name:string;
      email: string;
      shopName: string;
      phone: string;
      idNumber: string;
      password: string;
}

export type ShopType = {
    $id: string;
    ShopName: string;
    description: string;
    userId: string;
}

export type ListingType = {
    $id?: string;
    category: string;
    condition: string;
    availability: string;
    priceRange: string;
    model: string;
    type: string;
    description: string;
    price: number;
    imageUrls: string[];
    ContactPhone: string;
    displayTitle:string;
    shopId:string;
    shop?:ShopType;
};

export type AllListingPayloadType={
    category?:string[];
    condition?:string[];
    price?:string;
    model?:string[];
    type?:string[];
    keyword?:string;
}