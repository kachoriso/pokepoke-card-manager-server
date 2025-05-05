import { Controller, Get, Param, UseGuards, Req, ParseUUIDPipe, Post, HttpCode, HttpStatus, Body, Patch, ParseIntPipe } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { CreateWishlistItemDto } from './dto/create-wishlist-item.dto';
import { t_wishlist_items } from '@prisma/client';

interface RequestWithUser extends Request {
  user: {
    id: string;
    username: string;
  };
}

@Controller('wishlists')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) { }

  @Get('user/:userId/grouped')
  async getGroupedWishlistForUser(
    @Param('userId', ParseUUIDPipe) targetUserId: string,
    @Req() req: RequestWithUser
  ) {
    const currentUserId = req.user.id;
    return this.wishlistService.getGroupedWishlist(targetUserId, currentUserId);
  }

  /**
   * 指定されたIDのウィッシュリストアイテムを完了済みにする
   * @param itemId パスパラメータから取得するアイテムID
   * @param req リクエストオブジェクト (ログインユーザーID取得用)
   * @returns 更新されたウィッシュリストアイテム
   */
  @Patch(':itemId/done')
  @HttpCode(HttpStatus.OK)
  async markAsDone(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Req() req: RequestWithUser,
  ): Promise<t_wishlist_items> {
    const userId = req.user.id;
    console.log(`WishlistController: User ${userId} marking item ${itemId} as done.`);
    return this.wishlistService.markAsDone(itemId, userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Req() req: RequestWithUser,
    @Body() createWishlistItemDto: CreateWishlistItemDto
  ): Promise<t_wishlist_items> {
    const userId = req.user.id;
    console.log(`WishlistController: User ${userId} creating wishlist item:`, createWishlistItemDto);
    return this.wishlistService.create(userId, createWishlistItemDto);
  }

  // (参考) ログインユーザー自身のリストを取得するエンドポイント
  // @Get('mine/grouped')
  // async getMyGroupedWishlist(@Req() req: RequestWithUser) {
  //   const currentUserId = req.user.sub;
  //   return this.wishlistService.getGroupedWishlist(currentUserId, currentUserId);
  // }
}