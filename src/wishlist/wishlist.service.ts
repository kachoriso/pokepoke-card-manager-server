import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class WishlistService {
  constructor(
    private prisma: PrismaService
  ) { }

  /**
   * 指定されたユーザーのグループ化された欲しいものリストを取得する
   * @param targetUserId リストを取得したいユーザーのID
   * @param currentUserId リクエスト元のユーザーID (自分自身をホルダーから除外するため)
   * @returns GroupedTradePossibility の配列
   */
  async getGroupedWishlist(targetUserId: string, currentUserId: string): Promise<any[]> { // ★返り値の型を正しく設定
    const wishlistItems = await this.prisma.t_wishlist_items.findMany({
      where: { user_id: targetUserId, done: false },
      include: { m_packs: true, m_rarity: true },
      orderBy: { created_at: 'desc' }
    });

    if (wishlistItems.length === 0) {
      return [];
    }

    const wishCardIdentifiers = wishlistItems.map(item => ({
      pack_id: item.pack_id,
      card_no: item.card_no,
    }));

    const relevantInventory = await this.prisma.t_inventory_items.findMany({
      where: {
        user_id: { not: targetUserId },
        OR: wishCardIdentifiers,
        quantity: { gt: 0 }
      },
      include: {
        t_users: {
          select: {
            id: true,
            username: true,
            avatar_url: true
          },
        },
      },
    });

    const groupedResult = wishlistItems.map((wishItem): any => {
      const holders: any[] = relevantInventory
        .filter(inv => inv.pack_id === wishItem.pack_id && inv.card_no === wishItem.card_no && inv.t_users)
        .map(inv => ({
          friendId: inv.t_users.id,
          friendName: inv.t_users.username,
          friendIconUrl: inv.t_users.avatar_url,
          quantity: inv.quantity,
        }));

      const { m_packs, m_rarity, ...restOfWishItem } = wishItem;

      return {
        ...restOfWishItem,
        pack: m_packs ? { name: m_packs.pack_name ?? '' } : null,
        rarity: m_rarity ? { rarity: m_rarity.rarity, cost: m_rarity.cost } : null,
        holders
      };
    });

    return groupedResult;
  }
}