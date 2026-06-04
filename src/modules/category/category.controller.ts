import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, ParseFilePipe, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryParamsDto, UpdateCategoryDto } from './dto/update-category.dto';
import { endPoint } from './category.authorization';
import { auth, GetAllDto, GetAllResponse, ICategory, IResponse, User } from 'src/common';
import type { UserDocument } from 'src/db';
import { CategoryResponse } from './entities/category.entity';
import { successResponse } from 'src/utils/response';
import { FileInterceptor } from '@nestjs/platform-express';
import { cloudFileUpload, fileValidation } from 'src/utils/multer';



@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }


  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  // @FileInterceptor("attachment", cloudFileUpload({ validation: fileValidation.image })),
  @auth(endPoint.create)
  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto,
    // @UploadedFile(ParseFilePipe) file: Express.Multer.File,
    @User() user: UserDocument): Promise<IResponse<CategoryResponse>> {
    const category = await this.categoryService.create(createCategoryDto,/*file*/ user);
    return successResponse<CategoryResponse>({ status: 201, data: { category } })
  }

  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @auth(endPoint.create)
  @Patch(':CategoryId')
  async update(@Param() params: CategoryParamsDto, @Body() updateCategoryDto: UpdateCategoryDto, @User() user: UserDocument): Promise<IResponse<CategoryResponse>> {
    const category = await this.categoryService.update(params.CategoryId, updateCategoryDto, user);
    return successResponse<CategoryResponse>({ data: { category } })
  }


  @UseInterceptors(FileInterceptor("attachment", cloudFileUpload({ validation: fileValidation.image })))
  @auth(endPoint.create)
  @Patch(':CategoryId/attachment')
  async updateAttachment(@Param() params: CategoryParamsDto, @UploadedFile(ParseFilePipe) file: Express.Multer.File, @User() user: UserDocument): Promise<IResponse<CategoryResponse>> {
    const category = await this.categoryService.updateAttachment(params.CategoryId, file, user);
    return successResponse<CategoryResponse>({ data: { category } })
  }

  @Get()
  async findAll(@Query() query: GetAllDto): Promise<IResponse<GetAllResponse<ICategory>>> {
    const result = await this.categoryService.findAll(query);
    return successResponse<GetAllResponse<ICategory>>({ data: { result } })
  }


  @auth(endPoint.getArchived)
  @Get("/archived")
  async findAllArchived(@Query() query: GetAllDto): Promise<IResponse<GetAllResponse<ICategory>>> {
    const result = await this.categoryService.findAll(query, true);
    return successResponse<GetAllResponse<ICategory>>({ data: { result } })
  }

  @Get(':CategoryId')
  async findOne(@Param() params: CategoryParamsDto): Promise<IResponse<CategoryResponse>> {
    const category = await this.categoryService.findOne(params.CategoryId);
    return successResponse<CategoryResponse>({ data: { category } })
  }

  // @auth(endPoint.getArchived)
  @Get(':CategoryId/archived')
  async findOneArchived(@Param() params: CategoryParamsDto): Promise<IResponse<CategoryResponse>> {
    const category = await this.categoryService.findOne(params.CategoryId, true);
    return successResponse<CategoryResponse>({ data: { category } })
  }


  @auth(endPoint.create)
  @Delete(':CategoryId/freeze')
  async freeze(@Param() params: CategoryParamsDto, @User() user: UserDocument): Promise<IResponse> {
    await this.categoryService.freeze(params.CategoryId, user);
    return successResponse()
  }


  @auth(endPoint.create)
  @Patch(':CategoryId/restore')
  async restore(@Param() params: CategoryParamsDto, @User() user: UserDocument): Promise<IResponse<CategoryResponse>> {
    const category = await this.categoryService.restore(params.CategoryId, user);
    return successResponse<CategoryResponse>({ data: { category } })
  }


  @auth(endPoint.create)
  @Patch(':CategoryId/remove')
  async remove(@Param() params: CategoryParamsDto, @User() user: UserDocument): Promise<IResponse> {
    await this.categoryService.remove(params.CategoryId, user);
    return successResponse()
  }
}
