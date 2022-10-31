import { Module } from 'vuex'
import { RootState } from '@/store/types'
import { NetworkState } from '@/store/modules/network/types'

import { lux, avm, bintools, cChain, infoApi, pChain } from 'luxdefi'
import { LuxNetwork } from '@/js/LuxNetwork'
import { explorer_api } from '@/explorer_api'
import { BN } from 'luxdefi'
import { getPreferredHRP } from 'luxdefi/dist/utils'
import router from '@/router'
import { web3 } from '@/evm'
import { setSocketNetwork } from '../../../providers'
import { Network } from '@luxdefi/luxdefi-wallet-sdk'
const network_module: Module<NetworkState, RootState> = {
    namespaced: true,
    state: {
        status: 'disconnected', // disconnected | connecting | connected
        networks: [],
        networksCustom: [],
        selectedNetwork: null,
        txFee: new BN(0),
    },
    mutations: {
        addNetwork(state, net: LuxNetwork) {
            state.networks.push(net)
        },
    },
    getters: {
        allNetworks(state) {
            return state.networks.concat(state.networksCustom)
        },
    },
    actions: {
        addCustomNetwork({ state, dispatch }, net: LuxNetwork) {
            // Check if network alerady exists
            let networks = state.networksCustom
            // Do not add if there is a network already with the same url
            for (var i = 0; i < networks.length; i++) {
                let url = networks[i].url
                if (net.url === url) {
                    return
                }
            }
            state.networksCustom.push(net)
            dispatch('save')
        },

        async removeCustomNetwork({ state, dispatch }, net: LuxNetwork) {
            let index = state.networksCustom.indexOf(net)
            state.networksCustom.splice(index, 1)
            await dispatch('save')
        },
        saveSelectedNetwork({ state }) {
            let data = JSON.stringify(state.selectedNetwork?.url)
            localStorage.setItem('network_selected', data)
        },
        async loadSelectedNetwork({ dispatch, getters }): Promise<boolean> {
            let data = localStorage.getItem('network_selected')
            if (!data) return false
            try {
                // let net: LuxNetwork = JSON.parse(data);
                let nets: LuxNetwork[] = getters.allNetworks

                for (var i = 0; i < nets.length; i++) {
                    let net = nets[i]
                    if (JSON.stringify(net.url) === data) {
                        dispatch('setNetwork', net)
                        return true
                    }
                }
                return false
            } catch (e) {
                return false
            }
        },

        // Save custom networks to local storage
        save({ state }) {
            let data = JSON.stringify(state.networksCustom)
            localStorage.setItem('networks', data)
        },
        // Load custom networks from local storage
        load({ dispatch }) {
            let data = localStorage.getItem('networks')

            if (data) {
                let networks: LuxNetwork[] = JSON.parse(data)

                networks.forEach((n) => {
                    let newCustom = new LuxNetwork(
                        n.name,
                        n.url,
                        //@ts-ignore
                        parseInt(n.networkId),
                        n.explorerUrl,
                        n.explorerSiteUrl,
                        n.readonly
                    )
                    dispatch('addCustomNetwork', newCustom)
                })
            }
        },
        async setNetwork({ state, dispatch, commit, rootState }, net: LuxNetwork) {
            state.status = 'connecting'

            // Chose if the network should use credentials
            await net.updateCredentials()
            lux.setRequestConfig('withCredentials', net.withCredentials)
            lux.setAddress(net.ip, net.port, net.protocol)
            lux.setNetworkID(net.networkId)

            // Reset transaction history
            commit('History/clear', null, { root: true })

            // Query the network to get network id
            let chainIdX = await infoApi.getBlockchainID('X')
            let chainIdP = await infoApi.getBlockchainID('P')
            let chainIdC = await infoApi.getBlockchainID('C')

            avm.refreshBlockchainID(chainIdX)
            avm.setBlockchainAlias('X')
            pChain.refreshBlockchainID(chainIdP)
            pChain.setBlockchainAlias('P')
            cChain.refreshBlockchainID(chainIdC)
            cChain.setBlockchainAlias('C')

            avm.getLUXAssetID(true)
            pChain.getLUXAssetID(true)
            cChain.getLUXAssetID(true)

            state.selectedNetwork = net
            dispatch('saveSelectedNetwork')

            // Update explorer api
            explorer_api.defaults.baseURL = net.explorerUrl

            // Set web3 Network Settings
            let web3Provider = `${net.protocol}://${net.ip}:${net.port}/ext/bc/C/rpc`
            web3.setProvider(web3Provider)

            // Set socket connections
            setSocketNetwork(net)

            commit('Assets/removeAllAssets', null, { root: true })
            await dispatch('Assets/updateLuxAsset', null, { root: true })

            // If authenticated
            if (rootState.isAuth) {
                // Go back to wallet page
                router.replace('/wallet')
                for (var i = 0; i < rootState.wallets.length; i++) {
                    let w = rootState.wallets[i]
                    w.onnetworkchange()
                }
            }

            await dispatch('Assets/onNetworkChange', net, { root: true })
            dispatch('Assets/updateUTXOs', null, { root: true })
            dispatch('Platform/update', null, { root: true })
            dispatch('Platform/updateMinStakeAmount', null, { root: true })
            dispatch('updateTxFee')
            // Update tx history
            dispatch('History/updateTransactionHistory', null, { root: true })

            // Set the SDK Network
            let sdkNetConf = await Network.getConfigFromUrl(net.getFullURL())
            await Network.setNetworkAsync(sdkNetConf)
            // state.isConnected = true;
            state.status = 'connected'
            return true
        },

        async updateTxFee({ state }) {
            let txFee = await infoApi.getTxFee()
            state.txFee = txFee.txFee
            avm.setTxFee(txFee.txFee)
        },

        async init({ state, commit, dispatch }) {
            let mainnet = new LuxNetwork(
                'Mainnet',
                'https://api.lux.network:443',
                1,
                'https://explorerapi.lux.network',
                'https://explorer.lux.network',
                true
            )

            let fuji = new LuxNetwork(
                'Fuji',
                'https://testnet.luxcha.in:443',
                5,
                'https://explorerapi.lux-test.network',
                'https://explorer.lux-test.network',
                true
            )

            // Load custom networks if any
            try {
                await dispatch('load')
            } catch (e) {
                console.error(e)
            }

            commit('addNetwork', mainnet)
            commit('addNetwork', fuji)

            try {
                let isSet = await dispatch('loadSelectedNetwork')
                if (!isSet) {
                    await dispatch('setNetwork', state.networks[0])
                }
                return true
            } catch (e) {
                console.log(e)
                state.status = 'disconnected'
            }
        },
    },
}

export default network_module
