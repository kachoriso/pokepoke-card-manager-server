import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
// import { InventoryFormItem } from 'src/types'; // ★ レスポンス用の型定義

interface RequestWithUser extends Request {
  user: { userId: string; username: string; };
}

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  /**
   * 所持登録画面用のアイテムリストを取得する
   * @param req リクエストオブジェクト (ログインユーザーID取得用)
   */
  @Get('form-items')
  async getFormItems(@Req() req: RequestWithUser) {
    const currentUserId = req.user.userId;
    return this.inventoryService.getInventoryFormItems(currentUserId);
  }

  // --- 所持数登録/更新エンドポイント (今後実装) ---
  // @Put('item') または @Post()
  // async upsertItem(@Req() req: RequestWithUser, @Body() dto: UpsertInventoryItemDto) { ... }
}