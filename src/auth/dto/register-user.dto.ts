import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty
} from 'class-validator';

export class RegisterUserDto {
  @IsString({ message: 'ユーザー名は文字列である必要があります' })
  @IsNotEmpty({ message: 'ユーザー名は必須です' })
  @MinLength(2, { message: 'ユーザー名は2文字以上である必要があります' })
  @MaxLength(50, { message: 'ユーザー名は50文字以下である必要があります' })
  username: string;

  @IsEmail({}, { message: '有効なメールアドレスを入力してください' })
  @IsNotEmpty({ message: 'メールアドレスは必須です' })
  email: string;

  @IsString({ message: 'パスワードは文字列である必要があります' })
  @IsNotEmpty({ message: 'パスワードは必須です' })
  @MinLength(8, { message: 'パスワードは8文字以上である必要があります' })
  password: string;
}