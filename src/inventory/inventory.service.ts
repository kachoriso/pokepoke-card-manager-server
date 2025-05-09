import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryFormItem } from 'src/types';
import { UpsertInventoryItemDto } from './dto/upsert-inventory-item.dto';
import { t_inventory_items } from '@prisma/client';

@Injectable()
export class InventoryService {
    constructor(private prisma: PrismaService) { }

    /**
     * 所持登録画面に表示するためのデータを取得する
     * @param currentUserId ログイン中のユーザーID
     */
    async getInventoryFormItems(currentUserId: string): Promise<InventoryFormItem[]> {
        const otherWishlists = await this.prisma.t_wishlist_items.findMany({
            where: {
                user_id: { not: currentUserId },
                done: false,
            },
            include: {
                t_users: {
                    select: { id: true, username: true, avatar_url: true },
                },
                m_packs: true,
                m_rarity: true
            },
            orderBy: [
                { t_users: { username: 'asc' } },
                { created_at: 'desc' }
            ]
        });

        if (otherWishlists.length === 0) {
            return [];
        }

        const myInventoryItems = await this.prisma.t_inventory_items.findMany({
            where: { user_id: currentUserId },
            select: { pack_id: true, card_no: true, quantity: true }
        });

        const myInventoryMap = new Map<string, number>();
        myInventoryItems.forEach(item => {
            myInventoryMap.set(`${item.pack_id}_${item.card_no}`, item.quantity);
        });

        const formItems = otherWishlists.map(wish => {
            const inventoryKey = `${wish.pack_id}_${wish.card_no}`;
            const myQuantity = myInventoryMap.get(inventoryKey) ?? null;

            return {
                wishlistItemId: Number(wish.id),
                wisher: {
                    userId: wish.t_users.id,
                    userName: wish.t_users.username,
                    avatarUrl: wish.t_users.avatar_url || null
                },
                card_no: wish.card_no,
                pack_id: wish.pack_id,
                card_name: wish.card_name,
                rarity_id: wish.rarity_id,
                memo: wish.memo || null,
                pack: { name: wish.m_packs?.pack_name || "" },
                rarity: { rarity: wish.m_rarity.rarity, cost: wish.m_rarity.cost },
                my_quantity: myQuantity || 0
            };
        });

        return formItems;
    }

    /**
     * ログインユーザーが所持数を登録していない、他のユーザーの欲しいものリストアイテムの件数を取得する
     * @param currentUserId ログイン中のユーザーID
     * @returns 未登録件数
     */
    async getUnregisteredCount(currentUserId: string): Promise<{ count: number }> {
        console.log(`InventoryService: Getting unregistered count for user ${currentUserId}`);

        const result = await this.prisma.$queryRaw<[{ count: bigint }]>`
            SELECT COUNT(*)
            FROM public.t_wishlist_items w
            LEFT JOIN public.t_inventory_items i ON w.pack_id = i.pack_id
                AND w.card_no = i.card_no
                AND i.user_id = ${currentUserId}::uuid
            WHERE w.user_id != ${currentUserId}::uuid
                AND w.done = false
                AND i.id IS NULL;
        `;

        const count = result.length > 0 ? Number(result[0].count) : 0;

        console.log(`InventoryService: Unregistered count for user ${currentUserId}: ${count}`);
        return { count };
    }

    /**
     * ログインユーザーの特定のカードの所持枚数を登録または更新する (Upsert)
     * @param userId ログイン中のユーザーID
     * @param dto 登録/更新するカード情報と枚数
     * @returns 作成または更新された inventory アイテム
     */
    async upsertItem(userId: string, dto: UpsertInventoryItemDto): Promise<t_inventory_items> {
        const { pack_id, card_no, quantity, card_name, rarity_id, image_url } = dto;

        console.log(`InventoryService: Upserting item for user ${userId}:`, dto);

        try {
            const upsertedItem = await this.prisma.t_inventory_items.upsert({
                where: {
                    user_id_pack_id_card_no: {
                        user_id: userId,
                        pack_id: pack_id,
                        card_no: card_no
                    }
                },
                update: { quantity: quantity },
                create: {
                    user_id: userId,
                    pack_id: pack_id,
                    card_no: card_no,
                    quantity: quantity,
                    card_name: card_name,
                    rarity_id: rarity_id,
                    image_url: image_url
                },
            });
            console.log('Inventory item upserted:', upsertedItem);
            return upsertedItem;
        } catch (error) {
            if (error.code === 'P2003') {
                throw new BadRequestException('指定されたパックまたはレアリティが存在しません。');
            }
            console.error('Failed to upsert inventory item:', error);
            throw error;
        }
    }
}