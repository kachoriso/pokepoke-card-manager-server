import { Controller, Get, UseGuards } from '@nestjs/common';
import { PacksService } from './packs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { m_packs } from '@prisma/client';

@Controller('packs')
@UseGuards(JwtAuthGuard)
export class PacksController {
    constructor(private readonly packsService: PacksService) { }

    @Get()
    async findAll(): Promise<m_packs[]> {
        return this.packsService.findAll();
    }
}