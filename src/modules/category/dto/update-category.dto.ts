import { PartialType } from '@nestjs/mapped-types';
import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Validate } from 'class-validator';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';
import { CreateCategoryDto } from './create-category.dto';
import { contailField } from 'src/common/decorators/update.decorator';
import { MongoDbIds } from 'src/common';

@contailField()
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
    @Validate(MongoDbIds)
    @IsOptional()
    removedBrands?: Types.ObjectId[]
}


export class CategoryParamsDto {
    @IsMongoId()
    CategoryId: Types.ObjectId;
}


