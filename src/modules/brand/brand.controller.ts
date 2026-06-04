import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, ParseFilePipe, UseInterceptors, Query } from '@nestjs/common';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { BrandParamsDto, UpdateBrandDto } from './dto/update-brand.dto';
import { successResponse } from 'src/utils/response';
import { GetAllDto, GetAllResponse, User } from 'src/common';
import type { UserDocument } from 'src/db';
import { IBrand, IResponse } from 'src/common/interfaces';
import { BrandResponse } from './entities/brand.entity';
import { auth } from 'src/common/decorators/auth.decorator';
import { endPoint } from './brand.authorization';
import { FileInterceptor } from '@nestjs/platform-express';
import { cloudFileUpload, fileValidation } from 'src/utils/multer';

@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) { }

  // @UseInterceptors(FileInterceptor('attachment', cloudFileUpload({ validation: fileValidation.image })))

  @auth(endPoint.create)
  @Post()
  async create(@Body() createBrandDto: CreateBrandDto, @User() user: UserDocument): Promise<IResponse<BrandResponse>> {
    const brand = await this.brandService.create(createBrandDto, user);
    return successResponse<BrandResponse>({ status: 201, data: { brand } })
  }


  @auth(endPoint.create)
  @Patch(':brandId')
  async update(@Param() params: BrandParamsDto, @Body() updateBrandDto: UpdateBrandDto, @User() user: UserDocument): Promise<IResponse<BrandResponse>> {
    const brand = await this.brandService.update(params.brandId, updateBrandDto, user);
    return successResponse<BrandResponse>({ data: { brand } })
  }


  @UseInterceptors(FileInterceptor("attachment", cloudFileUpload({ validation: fileValidation.image })))

  @auth(endPoint.create)
  @Patch(':brandId/attachment')
  async updateAttachment(@Param() params: BrandParamsDto, @UploadedFile(ParseFilePipe) file: Express.Multer.File, @User() user: UserDocument): Promise<IResponse<BrandResponse>> {
    const brand = await this.brandService.updateAttachment(params.brandId, file, user);
    return successResponse<BrandResponse>({ data: { brand } })
  }

  @Get()
  async findAll(@Query() query: GetAllDto): Promise<IResponse<GetAllResponse<IBrand>>> {
    const result = await this.brandService.findAll(query);
    return successResponse<GetAllResponse<IBrand>>({ data: { result } })
  }


  @auth(endPoint.getArchived)
  @Get("/archived")
  async findAllArchived(@Query() query: GetAllDto): Promise<IResponse<GetAllResponse<IBrand>>> {
    const result = await this.brandService.findAll(query, true);
    return successResponse<GetAllResponse<IBrand>>({ data: { result } })
  }

  @Get(':brandId')
  async findOne(@Param() params: BrandParamsDto): Promise<IResponse<BrandResponse>> {
    const brand = await this.brandService.findOne(params.brandId);
    return successResponse<BrandResponse>({ data: { brand } })
  }

  // @auth(endPoint.getArchived)
  @Get(':brandId/archived')
  async findOneArchived(@Param() params: BrandParamsDto): Promise<IResponse<BrandResponse>> {
    const brand = await this.brandService.findOne(params.brandId, true);
    return successResponse<BrandResponse>({ data: { brand } })
  }


  @auth(endPoint.create)
  @Delete(':brandId/freeze')
  async freeze(@Param() params: BrandParamsDto, @User() user: UserDocument): Promise<IResponse> {
    await this.brandService.freeze(params.brandId, user);
    return successResponse()
  }


  @auth(endPoint.create)
  @Patch(':brandId/restore')
  async restore(@Param() params: BrandParamsDto, @User() user: UserDocument): Promise<IResponse<BrandResponse>> {
    const brand = await this.brandService.restore(params.brandId, user);
    return successResponse<BrandResponse>({ data: { brand } })
  }


  @auth(endPoint.create)
  @Patch(':brandId/remove')
  async remove(@Param() params: BrandParamsDto, @User() user: UserDocument): Promise<IResponse> {
    await this.brandService.remove(params.brandId, user);
    return successResponse()
  }


  // @Delete(':brandId')
  // remove(@Param('id') id: string) {
  //   return this.brandService.remove(+id);
  // }
}
