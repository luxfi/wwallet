# Lux Wallet

This is the web based Lux Wallet for [Lux Network](https://lux.network).

## Prerequisites

- Node v18+ and pnpm v9+
- Lux client in Golang (https://github.com/luxfi/node)

## Installation

1. Clone the repo `git clone https://github.com/luxfi/wallet.git`
2. Go to root of the project `cd wallet`
3. Install javascript dependencies with `pnpm install`.

## Running The Project

In order for the wallet to work, it needs the Lux network to operate on. By default the wallet will connect to the Lux mainnet.

1. If you want to connect to a local network, make sure you have installed and able to run a AvlaancheGo node properly.
2. Run the project with hot reloading `pnpm serve`

When you go to the website on your browser, you might get a warning saying
"Site is not secure". This is because we are signing our own SSL Certificates. Please ignore and continue to the website.

## Deployment

1.  Compile and minify to have a production ready application with `pnpm build`.
2.  Serve from the `/dist` directory.

## Changing the Network

By default the wallet will connect to the Lux tmainnet. You can change to another network by clicking the button labeled `TestNet` on the navigation bar and selecting another network, or add a custom network.

## Explorer API

A valid explorer API is required to correctly display balances for Mnemonic and Ledger type wallets.
The wallet uses the [Lux Explorer API](https://explore.lux.network) to display wallet transaction history.

## Browser Support

We suggest using Google Chrome to view the Lux Wallet website.

### Firefox and https

Firefox does not allow https requests to localhost. But the Lux Wallet uses https by default, so we will need to change this to http. Make this switch by editing the `vue.config.js` file in the root directory and change

```
devServer: {
    https: true
},
```

to

```
devServer: {
    https: false
},
```

and run `pnpm serve` to reflect the change.

# Accounts

The wallet can encrypt your private keys into a secure file encrypted by a password.

```json
{
    "accounts": iUserAccountEncrypted[]
}
```

# Language Setting

Saved into local storage as a 2 letter code.

```
"lang": "en"
```

# Dependencies

##### Lux Node (https://github.com/luxfi/node)

To get UTXOs and to send transactions.

#### Explorer API Node (https://github.com/luxfi/explorer)

To check if an address was used before, and to get activity history.

# Default Connections

The wallet needs to connect to an Lux node, and an explorer node to operate properly.

By default, there are two network options to connect to: `Mainnet` and `Testnet`.

##### Mainnet

-   Lux API: `https://api.lux.network`
-   Explorer API: `https://api.explore.lux.network`

##### Testnet

-   Lux API: `https://api.lux-test.network`
-   Explorer API: `https://api.explore.lux-test.network`
