import { Types } from "mongoose";


export interface IProduct {
    _id?: Types.ObjectId;

    name: string;
    slug: string;
    description?: string;
    images?: string[];

    originalPrice: number;
    discountPrice: number;
    salePrice: number;
    assetFolderId: string;

    stock: number;
    soldItems: number;

    category: Types.ObjectId;
    brand: Types.ObjectId;

    createdBy: Types.ObjectId;
    updatedBy?: Types.ObjectId;

    createdAt?: Date;
    updatedAt?: Date;

    freezedAt?: Date;
    restoredAt?: Date;
}