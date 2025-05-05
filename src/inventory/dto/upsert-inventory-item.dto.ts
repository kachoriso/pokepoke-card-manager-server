import { IsString, IsNotEmpty, IsInt, Min, IsOptional, IsUrl, MaxLength } from 'class-validator';

export class UpsertInventoryItemDto {
    @IsString()
    @IsNotEmpty({ message: 'パックIDは必須です。' })
    pack_id: string;

    @IsString()
    @IsNotEmpty({ message: 'カード番号は必須です。' })
    card_no: string;

    @IsInt({ message: '所持枚数は整数で入力してください。' })
    @Min(0, { message: '所持枚数は0以上で入力してください。' })
    quantity: number;

    @IsString()
    @IsNotEmpty({ message: 'カード名は必須です (新規作成時)。' })
    @MaxLength(100)
    card_name: string;

    @IsString()
    @IsNotEmpty({ message: 'レアリティIDは必須です (新規作成時)。' })
    rarity_id: string;

    @IsUrl({}, { message: '画像URLは有効なURL形式で入力してください。' })
    @IsOptional()
    image_url?: string;
}