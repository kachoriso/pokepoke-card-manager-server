import { Controller, Get, UseGuards } from '@nestjs/common';
import { RaritiesService } from './rarities.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { m_rarity } from '@prisma/client';

@Controller('rarities')
@UseGuards(JwtAuthGuard)
export class RaritiesController {
    constructor(private readonly raritiesService: RaritiesService) { }

    @Get()
    async findAll(): Promise<m_rarity[]> {
        return this.raritiesService.findAll();
    }
}