// packages/server/src/users/users.module.ts
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
// import { UsersController } from './users.controller'; // もし今後ユーザー情報取得などのAPIを作る場合は追加
import { PrismaModule } from '../prisma/prisma.module'; // UsersService が PrismaService を使うためインポート

@Module({
  imports: [
    PrismaModule, // UsersService が PrismaService を DI するために必要
                 // もし PrismaModule に @Global() を付けていれば、厳密にはここでの import は不要ですが、
                 // 依存関係を明確にするために記述しておくのが一般的です。
  ],
  // もし '/users' のようなエンドポイントを作る場合はここに UsersController を追加します
  // controllers: [UsersController],
  providers: [
    UsersService, // UsersService をこのモジュールのプロバイダーとして登録
  ],
  exports: [
    UsersService, // ★ UsersService をエクスポートして、AuthModule など他のモジュールから注入できるようにする
  ]
})
export class UsersModule {}