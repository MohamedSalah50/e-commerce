import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, ParseFilePipe, UseInterceptors } from '@nestjs/common';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { successResponse } from 'src/utils/response';
import { User } from 'src/common';
import type { UserDocument } from 'src/db';
import { IResponse } from 'src/common/interfaces';
import { BrandResponse } from './entities/brand.entity';
import { auth } from 'src/common/decorators/auth.decorator';
import { endPoint } from './authorization.brand';
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



  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateBrandDto: UpdateBrandDto) {
  //   return this.brandService.update(+id, updateBrandDto);
  // }

  // @Get()
  // findAll() {
  //   return this.brandService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.brandService.findOne(+id);
  // }


  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.brandService.remove(+id);
  // }
}
