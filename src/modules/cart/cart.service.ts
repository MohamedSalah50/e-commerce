import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { RemoveFromCartDto, UpdateCartDto } from './dto/update-cart.dto';
import { CartDocument, CartRepository, ProductRepository, UserDocument } from 'src/db';
import { Lean } from 'src/db/repository/database.repository';

@Injectable()
export class CartService {
  constructor(private readonly cartRepository: CartRepository, private readonly productRepository: ProductRepository) { }
  async create(createCartDto: CreateCartDto, user: UserDocument): Promise<{ status: number, cart: CartDocument }> {
    const product = await this.productRepository.findOne({ filter: { _id: createCartDto.productId, stock: { $gt: createCartDto.quantity } } });
    if (!product) {
      throw new NotFoundException('Product not found or out of stock');
    }
    const cart = await this.cartRepository.findOne({ filter: { createdBy: user._id } });
    if (!cart) {
      const [newCart] = await this.cartRepository.create
        ({ data: [{ createdBy: user._id, products: [{ productId: product._id, quantity: createCartDto.quantity }] }] });
      if (!newCart) {
        throw new NotFoundException('fail to create cart');
      }
      return { status: 201, cart: newCart };
    }

    const checkProductInCart = cart.products.find((product) => { return product.productId == createCartDto.productId });

    if (checkProductInCart) {
      checkProductInCart.quantity += createCartDto.quantity;
    } else {
      cart.products.push({ productId: product._id, quantity: createCartDto.quantity });
    }
    const updatedCart = await cart.save();
    return { status: 200, cart: updatedCart as CartDocument };
  }


  async removeFromCart(removeFromCartDto: RemoveFromCartDto, user: UserDocument): Promise<CartDocument | Lean<CartDocument>> {

    const cart = await this.cartRepository.findOneAndUpdate({
      filter: { createdBy: user._id },
      update: {
        $pull: { products: { _id: { $in: removeFromCartDto.productId } } }
      }
    });
    if (!cart) {
      throw new NotFoundException('fail to find matching cart');
    }

    return cart;
  }

  async remove(user: UserDocument): Promise<string> {

    const cart = await this.cartRepository.deleteOne({
      filter: { createdBy: user._id },
    });
    if (!cart.deletedCount) {
      throw new NotFoundException('fail to find matching cart');
    }

    return "dene";
  }

  async findOne(user: UserDocument): Promise<CartDocument | Lean<CartDocument>> {

    const cart = await this.cartRepository.findOne({
      filter: { createdBy: user._id },
      options: { populate: [{ path: 'products.productId' }] }
    });
    if (!cart) {
      throw new NotFoundException('fail to find matching cart');
    }

    return cart;
  }


  findAll() {
    return `This action returns all cart`;
  }

  update(id: number, updateCartDto: UpdateCartDto) {
    return `This action updates a #${id} cart`;
  }


}
