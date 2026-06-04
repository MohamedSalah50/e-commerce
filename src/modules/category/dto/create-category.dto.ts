import { IsOptional, IsString, MaxLength, MinLength, Validate } from "class-validator";
import { Types } from "mongoose";
import { MongoDbIds } from "src/common";
import { ICategory } from "src/common/interfaces";
export class CreateCategoryDto implements Partial<ICategory> {
    @MaxLength(50)
    @MinLength(2)
    @IsString()
    name: string;
    @MaxLength(5000)
    @MinLength(2)
    @IsString()
    @IsOptional()
    description: string;
    @Validate(MongoDbIds)
    @IsOptional()
    brands?: Types.ObjectId[];
}
