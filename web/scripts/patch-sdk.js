#!/usr/bin/env node
// Patch @luxfi/wallet-sdk to use coin type 60 (Ethereum) instead of 9000 (Avalanche)
// Lux uses m/44'/60'/0' for P/X chain HD derivation, not m/44'/9000'/0'
const fs = require('fs')
const path = require('path')

const sdkPath = path.resolve(__dirname, '../node_modules/@luxfi/wallet-sdk/dist/index.js')

try {
  // Follow symlinks (pnpm uses them)
  const realPath = fs.realpathSync(sdkPath)
  let content = fs.readFileSync(realPath, 'utf8')

  if (content.includes("LUX_TOKEN_INDEX = '9000'")) {
    content = content.replace("LUX_TOKEN_INDEX = '9000'", "LUX_TOKEN_INDEX = '60'")
    fs.writeFileSync(realPath, content)
    console.log('Patched @luxfi/wallet-sdk: coin type 9000 → 60')
  }
} catch (e) {
  // Silently skip if SDK not installed yet
}
