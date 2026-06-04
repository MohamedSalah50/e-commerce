import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, UseInterceptors, UploadedFile, ParseFilePipe } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { auth, IResponse, User } from 'src/common';
import { endPoint } from './authorization.coupon';
import { type UserDocument } from 'src/db';
import { FileInterceptor } from '@nestjs/platform-express';
import { cloudFileUpload, fileValidation } from 'src/utils/multer';
import { successResponse } from 'src/utils/response';
import { CouponResponse } from './entities/coupon.entity';

@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) { }

  @UseInterceptors(FileInterceptor('attachments', cloudFileUpload({ validation: fileValidation.image })))
  @auth(endPoint.create)
  @Post()
  async create(@User() user: UserDocument,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File,
    @Body() createCouponDto: CreateCouponDto): Promise<IResponse<CouponResponse>> {
    const coupon = await this.couponService.create(user, file, createCouponDto);
    return successResponse<CouponResponse>({ data: { coupon } });
  }

  @Get()
  findAll() {
    return this.couponService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.couponService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCouponDto: UpdateCouponDto) {
    return this.couponService.update(+id, updateCouponDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.couponService.remove(+id);
  }
}
