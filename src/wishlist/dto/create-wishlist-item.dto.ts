import { IsString, IsNotEmpty, IsInt, Min, IsOptional, IsUrl, MaxLength } from 'class-validator';

export class CreateWishlistItemDto {
    @IsString()
    @IsNotEmpty({ message: 'パックIDは必須です。' })
    pack_id: string;

    @IsString()
    @IsNotEmpty({ message: 'カード番号は必須です。' })
    card_no: string;

    @IsString()
    @IsNotEmpty({ message: 'カード名は必須です。' })
    @MaxLength(100, { message: 'カード名は100文字以内で入力してください。' })
    card_name: string;

    @IsString()
    @IsNotEmpty({ message: 'レアリティIDは必須です。' })
    rarity_id: string;

    @IsString()
    @IsOptional()
    @MaxLength(500, { message: 'メモは500文字以内で入力してください。' })
    memo?: string;
}