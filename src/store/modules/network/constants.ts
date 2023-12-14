import { AvaNetwork } from '@/js/AvaNetwork'

export const MainnetConfig = new AvaNetwork(
    'Mainnet',
    'https://api.lux.network:443',
    1,
    'https://explorerapi.lux.network',
    'https://explorer-xp.lux.network',
    true
)

export const TestnetConfig = new AvaNetwork(
    'Fuji',
    'https://api.lux-test.network:443',
    5,
    'https://explorerapi.lux-test.network',
    'https://explorer-xp.lux-test.network',
    true
)
