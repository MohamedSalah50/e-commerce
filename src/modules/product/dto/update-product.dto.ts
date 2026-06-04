import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsMongoId } from 'class-validator';
import { Types } from 'mongoose';
import { contailField } from 'src/common/decorators/update.decorator';

@contailField()
export class UpdateProductDto extends PartialType(CreateProductDto) { }


export class ProductParamsDto {
    @IsMongoId()
    productId: Types.ObjectId;
}


export class UpdateProductAttachmentsDto {
    removedAttachments: string[];
}