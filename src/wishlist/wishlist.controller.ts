// src/wishlist/wishlist.controller.ts
import { Controller, Get, Param, UseGuards, Req, ParseUUIDPipe } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // 認証ガードをインポート
import { Request } from 'express'; // リクエストオブジェクトの型

interface RequestWithUser extends Request {
  user: {
    userId: string;
    username: string;
  };
}

@Controller('wishlists')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get('user/:userId/grouped')
  async getGroupedWishlistForUser(
    @Param('userId', ParseUUIDPipe) targetUserId: string,
    @Req() req: RequestWithUser
  ) {
    const currentUserId = req.user.userId;
    return this.wishlistService.getGroupedWishlist(targetUserId, currentUserId);
  }

  // (参考) ログインユーザー自身のリストを取得するエンドポイント
  // @Get('mine/grouped')
  // async getMyGroupedWishlist(@Req() req: RequestWithUser) {
  //   const currentUserId = req.user.sub;
  //   return this.wishlistService.getGroupedWishlist(currentUserId, currentUserId);
  // }
}