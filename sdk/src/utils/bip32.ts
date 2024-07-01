import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';

// import * as ecc from '@bitcoinerlab/secp256k1';
// import { BIP32Factory } from 'bip32';
// You must wrap a tiny-secp256k1 compatible implementation
console.log('ecc======>', ecc);

const bip32 = BIP32Factory(ecc);
console.log('bip32======>', bip32);

export default bip32;
