import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandRepository } from 'src/db';
import type { UserDocument } from "src/db"
import type { BrandDocument } from "src/db"
import { S3Service } from 'src/common/services';
import slugify from 'slugify';
@Injectable()
export class BrandService {
  constructor(private readonly brandRepository: BrandRepository,
    private readonly s3service: S3Service) { }
  async create(createBrandDto: CreateBrandDto, user: UserDocument): Promise<BrandDocument> {
    const { name, slogan } = createBrandDto;

    const dublicatedBrand = await this.brandRepository.findOne({ filter: { name } })

    if (dublicatedBrand) {
      throw new ConflictException('brand already exists')
    }

    // const image = await this.s3service.uploadFile({  path: `brand` })
    // const slug = slugify(name, { lower: true });

    const [brand] = await this.brandRepository.create({
      data: [{ name, slogan, createdBy: user._id }]
    })

    // if (!brand) {
    // await this.s3service.deleteFile({ Key: image })
    //   throw new BadRequestException('fail to create brand')
    // }
    return brand;
  }

  findAll() {
    return `This action returns all brand`;
  }

  findOne(id: number) {
    return `This action returns a #${id} brand`;
  }

  update(id: number, updateBrandDto: UpdateBrandDto) {
    return `This action updates a #${id} brand`;
  }

  remove(id: number) {
    return `This action removes a #${id} brand`;
  }
}
