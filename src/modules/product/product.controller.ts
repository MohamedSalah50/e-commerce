import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipe,
  UsePipes,
  ValidationPipe,
  Query,
  Inject,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import {
  ProductParamsDto,
  UpdateProductAttachmentsDto,
  UpdateProductDto,
} from './dto/update-product.dto';
import type { UserDocument } from 'src/db';
import { FilesInterceptor } from '@nestjs/platform-express';
import { cloudFileUpload, fileValidation } from 'src/utils/multer';
import {
  auth,
  GetAllDto,
  GetAllResponse,
  IProduct,
  IResponse,
  storageEnum,
  TTL,
  User,
} from 'src/common';
import { endpoint } from './authorization.product';
import { productResponse } from './entities/product.entity';
import { successResponse } from 'src/utils/response';
// import { type RedisClientType } from 'redis';
// import { RedisCacheInterceptor } from 'src/common/interceptors/cache.interceptor';
import { Observable, of } from 'rxjs';

@Controller('product')
export class ProductController {
  constructor(
    // @Inject('REDIS_CLIENT') private readonly redisClient: RedisClientType,
    private readonly productService: ProductService,
  ) {}

  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  
  // @UseInterceptors(FilesInterceptor('attachments', 5, cloudFileUpload({ validation: fileValidation.image, storageAppraoch: storageEnum.disk })))
  @auth(endpoint.create)
  @Post()
  async create(
    @Body() createProductDto: CreateProductDto,
    @User() user: UserDocument,
    // @UploadedFiles(ParseFilePipe) Files: Express.Multer.File[]
  ) {
    const product = await this.productService.create(
      createProductDto,
      /*Files*/ user,
    );
    return successResponse<productResponse>({ data: { product } });
  }

  @auth(endpoint.create)
  @Patch(':productId')
  async update(
    @Param() params: ProductParamsDto,
    @Body() updateProductDto: UpdateProductDto,
    @User() user: UserDocument,
  ): Promise<IResponse<productResponse>> {
    const updatedProduct = await this.productService.update(
      params.productId,
      updateProductDto,
      user,
    );
    return successResponse<productResponse>({
      data: { product: updatedProduct },
    });
  }

  @UseInterceptors(
    FilesInterceptor(
      'attachments',
      5,
      cloudFileUpload({
        validation: fileValidation.image,
        storageAppraoch: storageEnum.disk,
      }),
    ),
  )
  @auth(endpoint.create)
  @Patch(':productId/attachments')
  async updateAttchments(
    @Param() params: ProductParamsDto,
    @Body() updateProductAttachmentsDto: UpdateProductAttachmentsDto,
    @User() user: UserDocument,
    @UploadedFiles(new ParseFilePipe({ fileIsRequired: false }))
    Files: Express.Multer.File[],
  ): Promise<IResponse<productResponse>> {
    const productAttachments = await this.productService.updateAttchments(
      params.productId,
      updateProductAttachmentsDto,
      user,
      Files,
    );
    return successResponse<productResponse>({
      data: { product: productAttachments },
    });
  }

  // @TTL(50)
  // @UseInterceptors(RedisCacheInterceptor)
  @Get()
  async findAll(
    @Query() query: GetAllDto,
  ): Promise<Observable<IResponse<GetAllResponse<IProduct>>>> {
    const result = await this.productService.findAll(query);
    return of(successResponse<GetAllResponse<IProduct>>({ data: { result } }));
  }

  @auth(endpoint.getArchived)
  @Get('/archived')
  async findAllArchived(
    @Query() query: GetAllDto,
  ): Promise<IResponse<GetAllResponse<IProduct>>> {
    const result = await this.productService.findAll(query, true);
    return successResponse<GetAllResponse<IProduct>>({ data: { result } });
  }

  @Get(':productId')
  async findOne(
    @Param() params: ProductParamsDto,
  ): Promise<IResponse<productResponse>> {
    const product = await this.productService.findOne(params.productId);
    return successResponse<productResponse>({ data: { product } });
  }

  // @auth(endPoint.getArchived)
  @Get(':productId/archived')
  async findOneArchived(
    @Param() params: ProductParamsDto,
  ): Promise<IResponse<productResponse>> {
    const product = await this.productService.findOne(params.productId, true);
    return successResponse<productResponse>({ data: { product } });
  }

  @auth(endpoint.create)
  @Delete(':productId/freeze')
  async freeze(
    @Param() params: ProductParamsDto,
    @User() user: UserDocument,
  ): Promise<IResponse> {
    await this.productService.freeze(params.productId, user);
    return successResponse();
  }

  @auth(endpoint.create)
  @Patch(':productId/restore')
  async restore(
    @Param() params: ProductParamsDto,
    @User() user: UserDocument,
  ): Promise<IResponse<productResponse>> {
    const product = await this.productService.restore(params.productId, user);
    return successResponse<productResponse>({ data: { product } });
  }

  @auth(endpoint.create)
  @Patch(':productId/remove')
  async remove(
    @Param() params: ProductParamsDto,
    @User() user: UserDocument,
  ): Promise<IResponse> {
    await this.productService.remove(params.productId, user);
    return successResponse();
  }

  @auth(endpoint.create)
  @Patch(':productId/add-to-wishlist')
  async addToWishlist(
    @Param() params: ProductParamsDto,
    @User() user: UserDocument,
  ): Promise<IResponse<productResponse>> {
    const product = await this.productService.addToWishlist(
      params.productId,
      user,
    );
    return successResponse<productResponse>({ data: { product } });
  }

  @auth(endpoint.create)
  @Patch(':productId/remove-from-wishlist')
  async removeFromWishlist(
    @Param() params: ProductParamsDto,
    @User() user: UserDocument,
  ): Promise<IResponse> {
    await this.productService.removeFromWishlist(params.productId, user);
    return successResponse();
  }
}
