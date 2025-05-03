import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { m_rarity } from '@prisma/client';

@Injectable()
export class RaritiesService {
    constructor(private prisma: PrismaService) { }

    async findAll(): Promise<m_rarity[]> {
        return this.prisma.m_rarity.findMany({
            orderBy: { id: 'asc' }
        });
    }
}