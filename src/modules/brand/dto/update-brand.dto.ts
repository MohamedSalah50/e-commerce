import { PartialType } from '@nestjs/mapped-types';
import { CreateBrandDto } from './create-brand.dto';
import { IsMongoId } from 'class-validator';
import { Types } from 'mongoose';
// import { contailField } from 'src/common/decorators/update.decorator';

// @contailField()
export class UpdateBrandDto extends PartialType(CreateBrandDto) { }


export class UpdateParamsDto {
    @IsMongoId()
    brandId: Types.ObjectId;
}