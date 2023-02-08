export type Symbol = {
  symbolId?: "ETHUSD" | "BTCUSD";
  walletId?: "ETH" | "BTC";
  leverage?: number;
  amount?: number;
  stop_loss?: number;
  take_profit?: number;
};

export type User = {
  apiKey: string;
  apiSecret: string;
  symbols: Array<Symbol>;
  status: string;
  actionId?: string;
  actionMessageId?: number;
  actionPayload?: any;
  selected_symbol?: "ETHUSD" | "BTCUSD";
};

export type Users = {
  [key: string]: User;
};
