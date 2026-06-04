import { Type } from "class-transformer";
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator";
import { CouponEnum, ICoupon } from "src/common";

export class CreateCouponDto implements Partial<ICoupon> {
    @Type(() => Number)
    @IsPositive()
    @IsNumber()
    discount: number;
    @IsNumber()
    @IsPositive()
    @Type(() => Number)
    duration: number;
    @IsEnum(CouponEnum)
    type: CouponEnum;
    @IsDateString()
    startDate: Date;
    @IsDateString()
    endDate: Date;
    @IsNotEmpty()
    @IsString()
    name: string;
}
