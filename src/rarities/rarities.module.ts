import { Module } from '@nestjs/common';
import { RaritiesService } from './rarities.service';
import { RaritiesController } from './rarities.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RaritiesController],
  providers: [RaritiesService]
})
export class RaritiesModule {}