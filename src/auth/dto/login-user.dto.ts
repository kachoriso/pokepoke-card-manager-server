import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
  // email フィールドのバリデーション
  @IsEmail(
    {},
    { message: '有効なメールアドレスの形式で入力してください。' },
  )
  @IsNotEmpty({ message: 'メールアドレスは必須項目です。' })
  email: string;

  // password フィールドのバリデーション
  @IsString({ message: 'パスワードは文字列である必要があります。' })
  @IsNotEmpty({ message: 'パスワードは必須項目です。' })
  password: string;
}