import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString, Matches } from "class-validator";
import { Types } from "mongoose";
import { IOrder } from "src/common";
import { PaymentEnum } from "src/common/enums/order.enum";


export class OrderParamsDto {
    @IsMongoId()
    orderId:Types.ObjectId;
}
export class CreateOrderDto implements Partial<IOrder> {
    @IsMongoId()
    @IsOptional()
    coupon?: Types.ObjectId;

    @IsNotEmpty()
    @IsString()
    address: string;

    @IsNotEmpty()
    @IsString()
    @IsOptional()
    note?: string;

    @Matches(/^(002|\+2)[0-9]{10}$/)
    phone: string;

    @IsEnum(PaymentEnum)
    payment: PaymentEnum;
}


