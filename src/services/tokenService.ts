import axios from 'axios';

export interface Token {
  id: string;
  name: string;
  symbol: string;
  icon?: string;
  decimals: number;
}

// Default tokens that will be shown initially
export const defaultTokens: Token[] = [
  {
    id: 'So11111111111111111111111111111111111111112',
    name: 'Solana',
    symbol: 'SOL',
    decimals: 9,
    icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
  },
  {
    id: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
  },
  {
    id: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    name: 'USDT',
    symbol: 'USDT',
    decimals: 6,
    icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png'
  },
  {
    id: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
    name: 'Marinade staked SOL',
    symbol: 'mSOL',
    decimals: 9,
    icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png'
  },
  {
    id: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    name: 'Bonk',
    symbol: 'BONK',
    decimals: 5,
    icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263/logo.png'
  }
];

/**
 * Search for tokens using Jupiter API
 * @param query Search query (symbol, name, or mint address)
 * @returns Promise with token search results
 */
export const searchTokens = async (query: string): Promise<Token[]> => {
  if (!query.trim()) {
    return defaultTokens;
  }

  try {
    const response = await axios.get(`https://lite-api.jup.ag/ultra/v1/search?query=${encodeURIComponent(query)}`);
    
    if (response.data && Array.isArray(response.data)) {
      // Map the response to our Token interface
      return response.data.slice(0, 10).map((token: any) => ({
        id: token.id || token.address || token.mint,
        name: token.name || 'Unknown Token',
        symbol: token.symbol || 'UNKNOWN',
        icon: token.icon || token.logoURI,
        decimals: token.decimals || 0
      }));
    }
    
    return defaultTokens;
  } catch (error) {
    console.error('Error searching tokens:', error);
    return defaultTokens;
  }
};