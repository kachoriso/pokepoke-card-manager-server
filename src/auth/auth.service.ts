import { Injectable, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcryptjs';
import { t_users } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  /**
   * ユーザー登録処理
   * @param registerUserDto 登録情報 (username, email, password)
   * @returns 作成されたユーザー情報 (パスワードハッシュ除く)
   */
  async register(registerUserDto: RegisterUserDto): Promise<Omit<t_users, 'password_hash'>> {
    const { username, email, password } = registerUserDto;

    // 1. メールアドレスが既に登録されていないか確認
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      // 既に存在する場合は 409 Conflict エラーを返す
      throw new ConflictException('このメールアドレスは既に使用されています');
    }

    // 2. パスワードをハッシュ化 (bcryptjs を使用)
    const saltRounds = 10; // ハッシュ化のコスト。数字が大きいほど安全だが時間もかかる。10-12が一般的。
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3. UsersService を使ってデータベースにユーザーを作成
    try {
      const newUser = await this.usersService.create({
        username,
        email,
        password_hash: hashedPassword,
        // avatar_url など他のカラムは UsersService.create で処理されるか、
        // Prisma スキーマのデフォルト値に依存
      });

      // 4. レスポンスとして返すデータからパスワードハッシュを除外
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password_hash, ...result } = newUser;
      return result;
    } catch (error) {
      // Prisma で発生する可能性のある一意制約違反エラー (例: username が UNIQUE の場合)
      if (error.code === 'P2002') {
        throw new ConflictException('ユーザー名またはメールアドレスが既に使用されています');
      }
      // その他の予期せぬエラーはそのままスロー
      throw error;
    }
  }

  /**
   * ユーザー認証の検証 (主にログイン処理の内部で使用)
   * @param loginUserDto ログイン情報 (email, password)
   * @returns 認証成功ならユーザー情報(パスワード除く)、失敗なら null
   */
  async validateUser(loginUserDto: LoginUserDto): Promise<Omit<t_users, 'password_hash'> | null> {
    const { email, password } = loginUserDto;
    const user = await this.usersService.findByEmail(email);

    // ユーザーが存在し、かつ提供されたパスワードがDBのハッシュと一致するか検証
    if (user && (await bcrypt.compare(password, user.password_hash))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password_hash, ...result } = user;
      return result; // 認証成功、パスワードハッシュを除いたユーザー情報を返す
    }
    return null; // ユーザーが見つからない、またはパスワードが不一致
  }

  /**
   * ログイン処理 (JWT を生成)
   * @param user 認証済みユーザー情報 (validateUserから受け取る想定)
   * @returns アクセストークン
   */
  async login(user: Omit<t_users, 'password_hash'>): Promise<{ access_token: string }> {
    const payload = { username: user.username, sub: user.id };

    // JWT を署名して生成
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRATION_TIME') || '60m',
    });

    return {
      access_token: accessToken,
    };
  }
}