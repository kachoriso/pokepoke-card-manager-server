import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { m_packs } from '@prisma/client';

@Injectable()
export class PacksService {
    constructor(private prisma: PrismaService) { }

    async findAll(): Promise<m_packs[]> {
        return this.prisma.m_packs.findMany({
            orderBy: { pack_id: 'asc' }
        });
    }
}