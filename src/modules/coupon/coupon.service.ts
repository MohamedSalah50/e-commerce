import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Coupon, CouponDocument, CouponRepository, type UserDocument } from 'src/db';
import { S3Service } from 'src/common/services';
import { FolderEnum } from 'src/common';

@Injectable()
export class CouponService {
  constructor(
    private readonly couponRepository: CouponRepository,
    private readonly s3Service: S3Service,
  ) { }
  async create(user: UserDocument, file: Express.Multer.File, createCouponDto: CreateCouponDto): Promise<CouponDocument> {
    const checkDuplicated = await this.couponRepository.findOne({ filter: { name: createCouponDto.name } });
    if (checkDuplicated) {
      throw new ConflictException('duplicated coupon name');
    }

    // const image = await this.s3Service.uploadFile({file,path:FolderEnum.coupon})
    const [coupon] = await this.couponRepository.create({
      data: [{
        ...createCouponDto,
        // image,
        createdBy: user._id
      }]
    })

    if (!coupon) {
      // await this.s3Service.deleteFile({Key:image})
      throw new BadRequestException('fail to create coupon');
    }
    return coupon;
  }

  findAll() {
    return `This action returns all coupon`;
  }

  findOne(id: number) {
    return `This action returns a #${id} coupon`;
  }

  update(id: number, updateCouponDto: UpdateCouponDto) {
    return `This action updates a #${id} coupon`;
  }

  remove(id: number) {
    return `This action removes a #${id} coupon`;
  }
}
