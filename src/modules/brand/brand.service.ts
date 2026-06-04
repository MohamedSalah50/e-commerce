import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandRepository } from 'src/db';
import type { UserDocument } from "src/db"
import type { BrandDocument } from "src/db"
import { S3Service } from 'src/common/services';
import { Types } from 'mongoose';
import { Lean } from 'src/db/repository/database.repository';
import { FolderEnum, GetAllDto } from 'src/common';
@Injectable()
export class BrandService {
  constructor(private readonly brandRepository: BrandRepository, private readonly s3Service: S3Service) { }
  async create(createBrandDto: CreateBrandDto, user: UserDocument): Promise<BrandDocument> {
    const { name, slogan } = createBrandDto;

    const dublicatedBrand = await this.brandRepository.findOne({ filter: { name, paranoId: false } })

    if (dublicatedBrand) {
      throw new ConflictException(dublicatedBrand.freezedAt ? "duplicated with freezed brand" : 'duplicated brand name')
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

  async findAll(data: GetAllDto, archived: boolean = false): Promise<{ doc_count?: number, pages?: number, current_page?: number | undefined, limit?: number, result: BrandDocument[] | Lean<BrandDocument>[] }> {
    const { page, size, search } = data;
    const result = await this.brandRepository.paginate({
      filter: {
        ...(search ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { slogan: { $regex: search, $options: 'i' } },
            { slug: { $regex: search, $options: 'i' } },
          ]
        } : {}),
        ...(archived ? { paranoId: false, freezedAt: { $exists: true } } : {})
      },
      page, size
    })
    return result;
  }

  async findOne(brandId: Types.ObjectId, archived: boolean = false): Promise<BrandDocument | Lean<BrandDocument>> {
    const brand = await this.brandRepository.findOne({
      filter: {
        _id: brandId,
        ...(archived ? { paranoId: false, freezedAt: { $exists: true } } : {})
      },
    })
    if (!brand) {
      throw new NotFoundException('fail to find matching brand')
    }
    return brand;
  }

  async update(brandId: Types.ObjectId, updateBrandDto: UpdateBrandDto, user: UserDocument): Promise<BrandDocument | Lean<BrandDocument>> {

    if (updateBrandDto.name && await this.brandRepository.findOne({ filter: { name: updateBrandDto.name } })) {
      throw new ConflictException('brand already exists')
    }

    const brand = await this.brandRepository.findOneAndUpdate
      ({ filter: { _id: brandId }, update: { ...updateBrandDto, updatedBy: user._id } });

    if (!brand) {
      throw new BadRequestException('fail to update brand')
    }

    return brand;
  }



  async updateAttachment(brandId: Types.ObjectId, file: Express.Multer.File, user: UserDocument): Promise<BrandDocument | Lean<BrandDocument>> {

    const image = await this.s3Service.uploadFile({ file, path: FolderEnum.brand })

    const brand = await this.brandRepository.findOneAndUpdate
      ({ filter: { _id: brandId }, update: { image, updatedBy: user._id }, options: { new: false } });

    if (!brand) {
      await this.s3Service.deleteFile({ Key: image })
      throw new BadRequestException('fail to find matching brand')
    }
    await this.s3Service.deleteFile({ Key: brand.image })
    brand.image = image;
    return brand;
  }

  async freeze(brandId: Types.ObjectId, user: UserDocument): Promise<string> {

    const brand = await this.brandRepository.findOneAndUpdate({
      filter: { _id: brandId },
      update: { freezedAt: new Date(), $unset: { restoredAt: true }, updatedBy: user._id },
      options: { new: false }
    });

    if (!brand) {
      throw new BadRequestException('fail to find matching brand')
    }

    return "done";
  }

  async restore(brandId: Types.ObjectId, user: UserDocument): Promise<BrandDocument | Lean<BrandDocument>> {

    const brand = await this.brandRepository.findOneAndUpdate({
      filter: { _id: brandId, paranoId: false, freezedAt: { $exists: true } },
      update: { restoredAt: new Date(), $unset: { freezedAt: true }, updatedBy: user._id },
      options: { new: false }
    });

    if (!brand) {
      throw new BadRequestException('fail to find matching brand')
    }

    return brand;
  }

  async remove(brandId: Types.ObjectId, user: UserDocument): Promise<string> {

    const brand = await this.brandRepository.findOneAndDelete({
      filter: { _id: brandId, paranoId: false, freezedAt: { $exists: true } },
    });

    if (!brand) {
      throw new BadRequestException('fail to find matching brand')
    }

    // await this.s3Service.deleteFile({ Key: brand.image })

    return "done";
  }
}
