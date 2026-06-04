import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Types } from 'mongoose';
import { BrandRepository, CategoryDocument, CategoryRepository, UserDocument } from 'src/db';
import { S3Service } from 'src/common/services';
import { Lean } from 'src/db/repository/database.repository';
import { FolderEnum, GetAllDto } from 'src/common';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository, private readonly brandRepository: BrandRepository, private readonly s3Service: S3Service) { }
  async create(createCategoryDto: CreateCategoryDto, user: UserDocument): Promise<CategoryDocument> {
    const { name } = createCategoryDto;

    const dublicatedBrand = await this.categoryRepository.findOne({ filter: { name, paranoId: false } })

    if (dublicatedBrand) {
      throw new ConflictException(dublicatedBrand.freezedAt ? "duplicated with freezed category" : 'duplicated category name')
    }

    const brands: Types.ObjectId[] = [...new Set(createCategoryDto.brands || [])]

    if (brands && (await this.brandRepository.find({ filter: { _id: { $in: brands } } })).length !== brands.length) {
      throw new NotFoundException('some of mentioned brands not exist')
    }

    // let assetFolderId = randomUUID();
    // const image: string = await this.s3service.uploadFile({ file, path: `${FolderEnum.category}/${assetFolderId}` })

    const [category] = await this.categoryRepository.create({
      data: [{
        ...createCategoryDto,
        name, /*image ,assertFolderId */  createdBy: user._id, brands: brands.map((brand) => {
          return Types.ObjectId.createFromBase64(brand as unknown as string)
        })
      }]
    })

    // if (!category) {
    // await this.s3service.deleteFile({ Key: image })
    //   throw new BadRequestException('fail to create category')
    // }
    return category;
  }

  async findAll(data: GetAllDto, archived: boolean = false): Promise<{ doc_count?: number, pages?: number, current_page?: number | undefined, limit?: number, result: CategoryDocument[] | Lean<CategoryDocument>[] }> {
    const { page, size, search } = data;
    const result = await this.categoryRepository.paginate({
      filter: {
        ...(search ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { slogan: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
          ]
        } : {}),
        ...(archived ? { paranoId: false, freezedAt: { $exists: true } } : {})
      },
      page, size
    })
    return result;
  }



  async update(CategoryId: Types.ObjectId, updateCategoryDto: UpdateCategoryDto, user: UserDocument): Promise<CategoryDocument | Lean<CategoryDocument>> {


    const { name } = updateCategoryDto;

    const dublicatedBrand = await this.categoryRepository.findOne({ filter: { name, paranoId: false } })

    if (dublicatedBrand) {
      throw new ConflictException(dublicatedBrand.freezedAt ? "duplicated with freezed category" : 'duplicated category name')
    }

    const brands: Types.ObjectId[] = [...new Set(updateCategoryDto.brands || [])]

    if (brands && (await this.brandRepository.find({ filter: { _id: { $in: brands } } })).length !== brands.length) {
      throw new NotFoundException('some of mentioned brands not exist')
    }

    const removedBrands = updateCategoryDto.removedBrands || [];
    delete updateCategoryDto.removedBrands;

    const category = await this.categoryRepository.findOneAndUpdate({
      filter: { _id: CategoryId },
      update: [
        {
          $set: {
            ...updateCategoryDto,
            updatedBy: user._id,
            brands: {
              $setUnion: [
                {
                  $setDifference: [
                    "$brands",
                    (removedBrands || []).map((brand) =>
                      Types.ObjectId.createFromHexString(brand as unknown as string)
                    ),
                  ],
                },
                brands.map((brand) =>
                  Types.ObjectId.createFromHexString(brand as unknown as string)
                ),
              ],
            },
          },
        },
      ],
    })


    if (!category) {
      // await this.s3service.deleteFile({ Key: image })
      throw new BadRequestException('fail to create category')
    }
    return category;
  }



  async updateAttachment(CategoryId: Types.ObjectId, file: Express.Multer.File, user: UserDocument): Promise<CategoryDocument | Lean<CategoryDocument>> {


    const category = await this.categoryRepository.findOne
      ({ filter: { _id: CategoryId } });


    if (!category) {
      throw new BadRequestException('fail to find matching category')
    }


    const image = await this.s3Service.uploadFile({ file, path: `${FolderEnum.category}/${CategoryId}` })



    const updatedCategory = await this.categoryRepository.findOneAndUpdate({
      filter: { _id: CategoryId },
      update: { image, updatedBy: user._id },
    })

    if (!updatedCategory) {
      await this.s3Service.deleteFile({ Key: image })
      throw new BadRequestException('fail to find matching category')
    }
    await this.s3Service.deleteFile({ Key: category.image })
    return updatedCategory;
  }

  async freeze(CategoryId: Types.ObjectId, user: UserDocument): Promise<string> {

    const category = await this.categoryRepository.findOneAndUpdate({
      filter: { _id: CategoryId },
      update: { freezedAt: new Date(), $unset: { restoredAt: true }, updatedBy: user._id },
      options: { new: false }
    });

    if (!category) {
      throw new BadRequestException('fail to find matching category')
    }

    return "done";
  }

  async restore(CategoryId: Types.ObjectId, user: UserDocument): Promise<CategoryDocument | Lean<CategoryDocument>> {

    const category = await this.categoryRepository.findOneAndUpdate({
      filter: { _id: CategoryId, paranoId: false, freezedAt: { $exists: true } },
      update: { restoredAt: new Date(), $unset: { freezedAt: true }, updatedBy: user._id },
      options: { new: false }
    });

    if (!category) {
      throw new BadRequestException('fail to find matching category')
    }

    return category;
  }

  async remove(CategoryId: Types.ObjectId, user: UserDocument): Promise<string> {

    const category = await this.categoryRepository.findOneAndDelete({
      filter: { _id: CategoryId, paranoId: false, freezedAt: { $exists: true } },
    });

    if (!category) {
      throw new BadRequestException('fail to find matching category')
    }

    // await this.s3Service.deleteFile({ Key: category.image })

    return "done";
  }
  async findOne(CategoryId: Types.ObjectId, archived: boolean = false): Promise<CategoryDocument | Lean<CategoryDocument>> {
    const category = await this.categoryRepository.findOne({
      filter: {
        _id: CategoryId,
        ...(archived ? { paranoId: false, freezedAt: { $exists: true } } : {})
      },
    })
    if (!category) {
      throw new NotFoundException('fail to find matching category')
    }
    return category;
  }
}
