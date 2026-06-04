import { PartialType } from '@nestjs/mapped-types';
import { CreateBrandDto } from './create-brand.dto';
import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { contailField } from 'src/common/decorators/update.decorator';
import { Type } from 'class-transformer';

@contailField()
export class UpdateBrandDto extends PartialType(CreateBrandDto) { }


export class BrandParamsDto {
    @IsMongoId()
    brandId: Types.ObjectId;
}
