import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
  @IsString()
  @IsNotEmpty({ message: 'ユーザー名またはメールアドレスは必須です。' })
  usernameOrEmail: string;

  @IsString({ message: 'パスワードは文字列である必要があります。' })
  @IsNotEmpty({ message: 'パスワードは必須項目です。' })
  password: string;
}