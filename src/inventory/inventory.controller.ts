import { Controller, Get, UseGuards, Req, Put, HttpCode, HttpStatus, Body } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { UpsertInventoryItemDto } from './dto/upsert-inventory-item.dto';
import { t_inventory_items } from '@prisma/client';
// import { InventoryFormItem } from 'src/types'; // ★ レスポンス用の型定義

interface RequestWithUser extends Request {
  user: { userId: string; username: string; };
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
    const currentUserId = req.user.userId;
    return this.inventoryService.getInventoryFormItems(currentUserId);
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
    const userId = req.user.userId;
    console.log(`InventoryController: User ${userId} upserting item:`, upsertInventoryItemDto);
    return this.inventoryService.upsertItem(userId, upsertInventoryItemDto);
  }
}