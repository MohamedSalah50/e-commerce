import { SetMetadata } from '@nestjs/common';
import { RoleEnum } from '../enums';

export const TTLName = 'TTLNAME';

export const TTL = (expires: number) => {
  return SetMetadata(TTLName, expires);
};
