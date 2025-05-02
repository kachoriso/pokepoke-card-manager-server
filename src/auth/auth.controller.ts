import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { t_users } from '@prisma/client';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * ユーザー登録エンドポイント
   * @param registerUserDto リクエストボディ (DTO でバリデーションされる)
   * @returns 作成されたユーザー情報 (パスワード除く)
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() registerUserDto: RegisterUserDto,
  ): Promise<Omit<t_users, 'password_hash'>> {
    console.log('Register request body:', registerUserDto);
    const createdUser = await this.authService.register(registerUserDto);

    console.log('User registered:', createdUser);
    return createdUser;
  }

  /**
   * ユーザーログイン
   * @param loginUserDto email と password
   * @returns アクセストークン
   */
  @Post('login')
  @HttpCode(HttpStatus.OK) // ログイン成功時は 200 OK
  async login(@Body() loginUserDto: LoginUserDto) {
    console.log('Login request body:', loginUserDto);
    const result = await this.authService.login(loginUserDto);
    console.log('Login successful, token generated.');
    return result;
  }

  /* --- 認証が必要なテスト用エンドポイント (今後実装) ---
  @Get('profile')
  @UseGuards(JwtAuthGuard) // ★ JwtAuthGuard で保護
  getProfile(@Req() req) {
    // JwtAuthGuard がリクエストオブジェクトに user を追加する (JwtStrategy の実装による)
    return req.user;
  }
  */
}