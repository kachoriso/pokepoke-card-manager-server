import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { t_users } from '@prisma/client';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    id: string;
    username: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

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

  /**
   * ログイン中のユーザー自身のプロファイル情報を取得する
   * @param req リクエストオブジェクト (JwtAuthGuard により user 情報が付与される)
   * @returns ユーザー情報 (パスワードハッシュ除く)
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: RequestWithUser) {
    console.log('req.user in controller:', req.user);
    const userId = req.user.id;
    return this.authService.getProfile(userId);
  }
}