import { Global, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModel, UserRepository } from 'src/db';
import { TokenModel } from 'src/db/models/token.model';
import { TokenRepository } from 'src/db/repository/token.repository';
import { TokenService } from 'src/utils/security/token.security';
import { createClient } from 'redis';

@Global()
@Module({
  imports: [UserModel, TokenModel],
  controllers: [],
  providers: [
    TokenRepository,
    UserRepository,
    JwtService,
    TokenService,
    {
      provide: 'REDIS_CLIENT',
      useFactory: async () => {
        const client = createClient({
          url: 'redis://localhost:6379',
        });
        client.on('error', (err) => console.error('redis client error', err));
        await client.connect();
        console.log('✅ redis connected');

        return client;
      },
    },
  ],
  exports: [
    JwtService,
    TokenRepository,
    UserRepository,
    TokenService,
    MongooseModule,
    'REDIS_CLIENT',
  ],
})
export class SharedAuthenticationModule {}
