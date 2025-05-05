import { Controller, Get, UseGuards, Req, Put, HttpCode, HttpStatus, Body } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { UpsertInventoryItemDto } from './dto/upsert-inventory-item.dto';
import { t_inventory_items } from '@prisma/client';
// import { InventoryFormItem } from 'src/types'; // ★ レスポンス用の型定義

interface RequestWithUser extends Request {
  user: {
    id: string;
    username: string;
  };
}

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) { }

  /**
   * 所持登録画面用のアイテムリストを取得する
   * @param req リクエストオブジェクト (ログインユーザーID取得用)
   */
  @Get('form-items')
  async getFormItems(@Req() req: RequestWithUser) {
    const currentUserId = req.user.id;
    return this.inventoryService.getInventoryFormItems(currentUserId);
  }

  /**
   * ログインユーザーが所持数を登録していない、他のユーザーの欲しいものリストの件数を取得する
   * @param req リクエストオブジェクト (ログインユーザーID取得用)
   * @returns 未登録件数を含むオブジェクト { count: number }
   */
  @Get('unregistered-count')
  async getUnregisteredCount(@Req() req: RequestWithUser): Promise<{ count: number }> {
    const currentUserId = req.user.id;
    console.log(`InventoryController: Getting unregistered count for user ${currentUserId}`);
    return this.inventoryService.getUnregisteredCount(currentUserId);
  }

  /**
   * ログインユーザーの特定のカードの所持枚数を登録/更新する
   * @param req リクエストオブジェクト (ログインユーザーID取得用)
   * @param upsertInventoryItemDto リクエストボディ (登録/更新データ)
   * @returns 作成/更新された inventory アイテム
   */
  @Put()
  @HttpCode(HttpStatus.OK)
  async upsertItem(
    @Req() req: RequestWithUser,
    @Body() upsertInventoryItemDto: UpsertInventoryItemDto,
  ): Promise<t_inventory_items> {
    const userId = req.user.id;
    console.log(`InventoryController: User ${userId} upserting item:`, upsertInventoryItemDto);
    return this.inventoryService.upsertItem(userId, upsertInventoryItemDto);
  }
}