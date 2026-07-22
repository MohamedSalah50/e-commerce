import { Types } from "mongoose";
import { IUser } from "./user.interface";
import { ICoupon } from "./coupon.interface";
import { IProduct } from "./product.interface";
import { OrderStatusEnum, PaymentEnum } from "../enums/order.enum";



export interface IOrderProduct {
    _id?: Types.ObjectId;

    productId: Types.ObjectId | IProduct;
    quantity: number;
    unitPrice: number;
    finalPrice: number;

    createdBy?: Types.ObjectId | IUser;
    updatedBy?: Types.ObjectId | IUser;

    createdAt?: Date;
    updatedAt?: Date;

    freezedAt?: Date;
    restoredAt?: Date;
}

export interface IOrder {
    _id: Types.ObjectId;
    orderId:string;
    address: string;
    phone: string;
    notes?: string
    cancelReason?: string;
    coupon?: Types.ObjectId | ICoupon;

    discount?: number;
    total: number;
    subTotal: number;

    paidAt?: Date;
    paymentIntent?: string;
    intentId?: string;

    products: IOrderProduct[]


    status: OrderStatusEnum;
    paymentType: PaymentEnum;

    createdBy: Types.ObjectId | IUser;
    updatedBy?: Types.ObjectId | IUser;

    createdAt?: Date;
    updatedAt?: Date;

    freezedAt?: Date;
    restoredAt?: Date;
}