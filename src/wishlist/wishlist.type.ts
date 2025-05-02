export interface HolderInfo {
    friendId: string;
    friendName: string;
    friendIconUrl?: string | null;
    quantity: number;
  }
  
  export interface GroupedTradePossibility {
    id: number;
    user_id: string;
    card_no: string;
    pack_id: string;
    card_name: string;
    rarity_id: string;
    cost_medal: number;
    memo?: string | null;
    image_url?: string | null;
    created_at: Date;
    updated_at: Date;
  
    pack?: { name: string; } | null;
    rarity?: { rarity: string; cost: number; } | null;
  
    holders: HolderInfo[];
  }