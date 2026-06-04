import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductAttachmentsDto, UpdateProductDto } from './dto/update-product.dto';
import { BrandRepository, CategoryDocument, CategoryRepository, Product, ProductDocument, ProductRepository, UserRepository, type UserDocument } from 'src/db';
import { S3Service } from 'src/common/services';
import { FolderEnum, GetAllDto } from 'src/common';
import { randomUUID } from 'crypto';
import { Types } from 'mongoose';
import { Lean } from 'src/db/repository/database.repository';

@Injectable()
export class ProductService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly productRepository: ProductRepository,
    private readonly brandRepository: BrandRepository,
    private readonly userRepository: UserRepository,
    private readonly s3Service: S3Service,
  ) { }
  async create(createProductDto: CreateProductDto, /*Files: Express.Multer.File[],*/ user: UserDocument): Promise<ProductDocument> {

    const { description, discountPrice, name, originalPrice, stock } = createProductDto;

    const category = await this.categoryRepository.findOne({ filter: { _id: createProductDto.category } });
    if (!category) throw new NotFoundException('fail to find matching product instance')
    const brand = await this.brandRepository.findOne({ filter: { _id: createProductDto.brand } });
    if (!brand) throw new NotFoundException('fail to find matching brand instance')

    let assetFolderId = randomUUID();
    //   // const images = await this.s3Service.uploadFiles({
    //   //   files: Files,
    //   //   path: `${FolderEnum.product}/${createProductDto.product}/${FolderEnum.product}/${assetFolderId}`
    //   // })

    const [product] = await this.productRepository.create({
      data: [{
        name,
        description,
        brand: brand._id,
        category: category._id,
        originalPrice,
        discountPrice,
        salePrice: originalPrice - (originalPrice * ((discountPrice || 0) / 100)),
        stock,
        createdBy: user._id,
        assetFolderId,
        // images,
      }]
    });

    return product;
  }

  async update(productId: Types.ObjectId, updateProductDto: UpdateProductDto, user: UserDocument): Promise<ProductDocument | Lean<ProductDocument>> {

    const product = await this.productRepository.findOne({ filter: { _id: productId } });
    if (!product) {
      throw new NotFoundException('fail to find matching product instance')
    }

    if (updateProductDto.category) {
      const product = await this.categoryRepository.findOne({ filter: { _id: updateProductDto.category } });
      if (!product) {
        throw new NotFoundException('fail to find matching product instance')
      }
      updateProductDto.category = product._id;
    }


    if (updateProductDto.brand) {
      const brand = await this.brandRepository.findOne({ filter: { _id: updateProductDto.brand } });
      if (!brand) {
        throw new NotFoundException('fail to find matching brand instance')
      }
      updateProductDto.brand = brand._id;
    }

    let salePrice = product.salePrice;
    if (updateProductDto.originalPrice || updateProductDto.discountPrice) {
      const originalPrice = updateProductDto.originalPrice ?? product.originalPrice;
      const discountPrice = updateProductDto.discountPrice ?? product.discountPrice;
      const finalPrice = originalPrice - (originalPrice * ((discountPrice || 0) / 100));
      salePrice = finalPrice > 0 ? finalPrice : 1;
    }

    const updatedProduct = await this.productRepository.findOneAndUpdate({
      filter: { _id: productId },
      update: { ...updateProductDto, salePrice, updatedBy: user._id }
    })

    if (!updatedProduct) {
      throw new NotFoundException('fail to find matching product instance')
    }

    return updatedProduct;
  }


  async updateAttchments(productId: Types.ObjectId, updateProductAttachmentsDto: UpdateProductAttachmentsDto,
    user: UserDocument, files: Express.Multer.File[]): Promise<ProductDocument | Lean<ProductDocument>> {

    const product = await this.productRepository.findOne({ filter: { _id: productId }, options: { populate: [{ path: 'product' }] } });
    if (!product) {
      throw new NotFoundException('fail to find matching product instance')
    }

    let attachments: string[] = []

    if (files?.length > 0) {
      attachments = await this.s3Service.uploadFiles({
        files,
        path: `${FolderEnum.product}/${(product.category as unknown as CategoryDocument).folderAssetId}/${FolderEnum.product}/${product.assetFolderId}`
      })
    }

    const removedAttachments = [...new Set(updateProductAttachmentsDto.removedAttachments ?? [])];

    const updatedProduct = await this.productRepository.findOneAndUpdate(
      {
        filter: { _id: productId },
        update: [
          {
            $set: {
              updatedBy: user._id,
              images: {
                $setUnion: [
                  {
                    $setDifference: [
                      "$images",
                      removedAttachments,
                    ],
                  },
                  attachments,
                ],
              },
            },
          },
        ],
      },
    );

    if (!updatedProduct) {
      await this.s3Service.deleteFiles({ urls: attachments })
      throw new NotFoundException('fail to find matching product instance')
    }
    await this.s3Service.deleteFiles({ urls: removedAttachments })

    return updatedProduct;
  }

  async findAll(data: GetAllDto, archived: boolean = false): Promise<{ doc_count?: number, pages?: number, current_page?: number | undefined, limit?: number, result: ProductDocument[] | Lean<ProductDocument>[] }> {
    const { page, size, search } = data;
    const result = await this.productRepository.paginate({
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

  async freeze(productId: Types.ObjectId, user: UserDocument): Promise<string> {

    const product = await this.productRepository.findOneAndUpdate({
      filter: { _id: productId },
      update: { freezedAt: new Date(), $unset: { restoredAt: true }, updatedBy: user._id },
      options: { new: false }
    });

    if (!product) {
      throw new BadRequestException('fail to find matching product')
    }

    return "done";
  }

  async restore(productId: Types.ObjectId, user: UserDocument): Promise<ProductDocument | Lean<ProductDocument>> {

    const product = await this.productRepository.findOneAndUpdate({
      filter: { _id: productId, paranoId: false, freezedAt: { $exists: true } },
      update: { restoredAt: new Date(), $unset: { freezedAt: true }, updatedBy: user._id },
      options: { new: false }
    });

    if (!product) {
      throw new BadRequestException('fail to find matching product')
    }

    return product;
  }

  async remove(productId: Types.ObjectId, user: UserDocument): Promise<string> {

    const product = await this.productRepository.findOneAndDelete({
      filter: { _id: productId, paranoId: false, freezedAt: { $exists: true } },
    });

    if (!product) {
      throw new BadRequestException('fail to find matching product')
    }

    // await this.s3Service.deleteFiles({ urls: product.images })

    return "done";
  }
  async findOne(productId: Types.ObjectId, archived: boolean = false): Promise<ProductDocument | Lean<ProductDocument>> {
    const product = await this.productRepository.findOne({
      filter: {
        _id: productId,
        ...(archived ? { paranoId: false, freezedAt: { $exists: true } } : {})
      },
    })
    if (!product) {
      throw new NotFoundException('fail to find matching product')
    }
    return product;
  }

  async addToWishlist(productId: Types.ObjectId, user: UserDocument): Promise<ProductDocument | Lean<ProductDocument>> {
    const product = await this.productRepository.findOne({ filter: { _Id: productId } })

    if (!product) {
      throw new NotFoundException('fail to find matching product instance')
    }

    await this.userRepository.updateOne({
      filter: { _id: user._id },
      update: {
        $addToSet: { wishList: product._id }
      }
    })
    return product;
  }


  async removeFromWishlist(productId: Types.ObjectId, user: UserDocument): Promise<string> {


    await this.userRepository.updateOne({
      filter: { _id: user._id },
      update: {
        $pull: { wishList: Types.ObjectId.createFromHexString(productId.toString()) }
      }
    })
    return "done";
  }
}
