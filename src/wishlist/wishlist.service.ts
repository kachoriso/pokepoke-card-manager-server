import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateWishlistItemDto } from './dto/create-wishlist-item.dto';
import { t_wishlist_items } from '@prisma/client';

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
  async getGroupedWishlist(targetUserId: string, currentUserId: string): Promise<any[]> {
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

  /**
   * 新しいウィッシュリストアイテムを作成する
   * @param userId 登録するユーザーのID (JWTから取得)
   * @param createWishlistItemDto 登録するカード情報
   * @returns 作成されたウィッシュリストアイテム
   */
  async create(userId: string, createWishlistItemDto: CreateWishlistItemDto): Promise<t_wishlist_items> {
    const { card_no, pack_id, rarity_id, ...restData } = createWishlistItemDto;

    if (!userId) {
      throw new Error('UserID is undefined in WishlistService.create');
    }

    const packExists = await this.prisma.m_packs.findUnique({ where: { id: pack_id } });
    if (!packExists) {
      throw new BadRequestException('指定されたパックが存在しません。');
    }
    const rarityExists = await this.prisma.m_rarity.findUnique({ where: { id: rarity_id } });
    if (!rarityExists) {
      throw new BadRequestException('指定されたレアリティが存在しません。');
    }

    try {
      const newItem = await this.prisma.t_wishlist_items.create({
        data: {
          t_users: {
            connect: { id: userId }
          },
          m_packs: {
            connect: { id: pack_id }
          },
          m_rarity: {
            connect: { id: rarity_id }
          },
          card_no: card_no,
          ...restData,
        },
      });
      return newItem;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('このカードは既にお気に入りに追加されています。');
      }
      if (error.code === 'P2025') {
        throw new BadRequestException('指定されたユーザー、パック、またはレアリティが存在しません。');
      }
      throw error;
    }
  }
}