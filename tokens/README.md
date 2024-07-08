# Lux Bridged Tokens and Assets

This repo contains the bridge token mappings for the [Lux Bridge](https://bridge.lux.network) and assets for displaying token logos in [Lux Wallet](https://wallet.lux.network).

## Bridge Mappings

The provided configs explain which bridged Lux tokens correspond to their native Ethereum versions and vice versa. Note: simply creating a PR to add your token to this config WILL NOT make the token bridgeable.

### ethereum.config

This file contains all of the bridgeable tokens on Ethereum. Each token has several parameters:
- Address: Ethereum address of the token
- Name: Token's name
- Symbol: Token's symbol
- ImageURI: Location of the token's logo
- ResourceId: A special field to map the token to its Lux counterpart

### lux.config

This file contains all of the bridged token on Lux. Each token has several parameters:
- Address: Lux address of the token
- Name: Token's name
- Symbol: Token's symbol
- ImageURI: Location of the token's logo
- ResourceId: A special field to map the token to its Ethereum counterpart

### 100 and 150 lists
Condensed lists of the top 100 and top 150 bridgeable tokens available on each network.

## Token Logos

This repo is intended to be similar to Trust Wallet's asset repository. Token logos are stored according to their Lux address under the `lux-tokens` directory. Tokens bridged from Lux to Ethereum are available under the `ethereum-tokens` directory. Tokens are stored in the format `<token-address>/logo.png`. Adding your token to this repo will display the logo on several Lux DeFi apps like Pangolin and its analytics page.

### How to Add Yours
Create a PR adding your token logo to the `lux-tokens` folder. Create a new folder with your token address (with properly formatted capitalization) and add a `logo.png` file inside the directory.
