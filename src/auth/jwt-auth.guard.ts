import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // ここにカスタムロジックを追加することも可能
  // (例: canActivate メソッドをオーバーライドして追加の検証を行うなど)
  // 基本的な JWT 検証のみであれば、このクラスの中身は空でも機能する
}