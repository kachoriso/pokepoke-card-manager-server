import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { t_users as User } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        configService: ConfigService,
        private usersService: UsersService
    ) {
        const jwtSecret = configService.get<string>('JWT_SECRET');
        if (!jwtSecret) {
            throw new Error('JWT_SECRET environment variable is not set!');
        }
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtSecret
        });
    }

    /**
     * トークンの署名が検証され、ペイロードが有効な場合に呼び出されるメソッド
     * このメソッドの返り値が req.user に格納される
     * @param payload JWT に含まれていたペイロード ({ username, sub })
     * @returns req.user に格納するユーザー情報オブジェクト
     */
    async validate(payload: { sub: string; username: string }): Promise<Omit<User, 'password_hash'>> {
        console.log('JWT Payload in validate:', payload);
        const user = await this.usersService.findById(payload.sub);
        if (!user) {
            throw new UnauthorizedException('ユーザーが見つかりません。');
        }
        const { password_hash, ...result } = user;
        return result;
    }
}