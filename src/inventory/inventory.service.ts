import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryFormItem } from 'src/types';

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

        formItems.sort((a, b) => {
            const aQuantity = a.my_quantity ?? 0;
            const bQuantity = b.my_quantity ?? 0;
            if (aQuantity === 0 && bQuantity !== 0) return -1;
            if (aQuantity !== 0 && bQuantity === 0) return 1;
            return 0;
        });

        return formItems;
    }

    // --- 所持数登録/更新メソッド (今後実装) ---
    // async upsertInventoryItem(userId: string, dto: UpsertInventoryItemDto) { ... }
}