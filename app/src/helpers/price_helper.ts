//const axios = require('axios')
//
//const COIN_ID = 'luxnet-2'
//const COINGECKO_URL =
//    'https://api.coingecko.com/api/v3/simple/price?ids=luxnet-2&vs_currencies=usd'
//
//const coingeckoApi = axios.create({
//    baseURL: 'https://api.coingecko.com/api/v3',
//    timeout: 10000,
//})
//
//export async function getLuxPriceUSD(): Promise<number> {
//    const res = await axios.get(COINGECKO_URL)
//    return res.data['luxnet-2']['usd']
//}
//
//let priceHistory: [number, number][] = []
//async function getPriceHistory() {
//    const res = await coingeckoApi.get(`/coins/${COIN_ID}/market_chart`, {
//        params: {
//            vs_currency: 'usd',
//            days: 'max',
//            interval: 'daily',
//        },
//    })
//
//    priceHistory = res.data.prices
//}
//
///**
// * Round the UNIX time in ms and search the previously fetched price points
// * @param time
// */
//export function getPriceAtUnixTime(time: number): number | undefined {
//    const remainder = time % (24 * 60 * 60 * 1000)
//    const dayTimestamp = time - remainder
//
//    const pricePair = priceHistory.find((value) => {
//        return value[0] == dayTimestamp
//    })
//
//    if (!pricePair) return undefined
//    return pricePair[1]
//}

export async function getLuxPriceUSD(): Promise<number> {
    // Hardcoded price
    return 0.00011
}

const priceHistory: [number, number][] = [
    // Hardcoded price history as an example
    [1622505600000, 0.0001],
    [1622592000000, 0.00012],
    [1622678400000, 0.00011],
    // Add more data points as needed
]


/**
 * Round the UNIX time in ms and search the previously fetched price points
 * @param time
 */
export function getPriceAtUnixTime(time: number): number | undefined {
    const remainder = time % (24 * 60 * 60 * 1000)
    const dayTimestamp = time - remainder

    const pricePair = priceHistory.find((value) => {
        return value[0] == dayTimestamp
    })

    if (!pricePair) return undefined
    return pricePair[1]
}

