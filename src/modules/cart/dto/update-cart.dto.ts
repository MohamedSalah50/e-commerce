import { PartialType } from '@nestjs/mapped-types';
import { CreateCartDto } from './create-cart.dto';
import { Types } from 'mongoose';
import { Validate } from 'class-validator';
import { MongoDbIds } from 'src/common';


export class RemoveFromCartDto {
    // @Validate(MongoDbIds)
    productId: Types.ObjectId[]
}
export class UpdateCartDto extends PartialType(CreateCartDto) { }
