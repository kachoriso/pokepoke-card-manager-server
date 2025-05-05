export interface InventoryFormItem {
    wishlistItemId: number;
    wisher: {
        userId: string;
        userName: string;
        avatarUrl?: string | null;
    };
    card_no: string;
    pack_id: string;
    card_name: string;
    rarity_id: string;
    memo?: string | null;
    pack: {
        name: string;
    }
    rarity: {
        rarity: string;
        cost: number;
    }
    my_quantity: number;
};