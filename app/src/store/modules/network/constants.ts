import { LuxNetwork } from '@/js/LuxNetwork'

export const MainnetConfig = new LuxNetwork(
    'Mainnet',
    'https://api.lux.network:443',
    1,
    'https://api-explore.lux.network',
    'https://explore.lux.network',
    true
)

export const TestnetConfig = new LuxNetwork(
    'Testnet',
    'https://api.lux-test.network:443',
    5,
    'https://api-explore.lux-test.network',
    'https://explore.lux-test.network',
    true
)
