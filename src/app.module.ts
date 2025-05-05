import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { PacksModule } from './packs/packs.module';
import { RaritiesModule } from './rarities/rarities.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    AuthModule,
    WishlistModule,
    PacksModule,
    RaritiesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }