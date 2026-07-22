import { Args, Query, Resolver } from '@nestjs/graphql';
import { OrderService } from './order.service';
import { GetAllOrdersResponse } from './entities/order.entity';
import { auth, GetAllGraphDto, RoleEnum, User } from 'src/common';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { type UserDocument } from 'src/db';

@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Resolver()
export class OrderResolver {
  constructor(private readonly orderService: OrderService) {}

  @Query(() => String, { deprecationReason: 'first welcome point of graphql' })
  sayHi(): string {
    return 'Hello graphQl with nestJs';
  }

  @auth([RoleEnum.admin])
  @Query(() => GetAllOrdersResponse, {
    name: 'allOrders',
    deprecationReason: 'get all orders',
  })
  async getAllOrder(
    @User() user: UserDocument,
    @Args('data' , { nullable: true }) getAllGraphDto: GetAllGraphDto,
  ) {
    const result = await this.orderService.findAll(getAllGraphDto, false);
    console.log({ result });

    return 'get all order';
  }
}
