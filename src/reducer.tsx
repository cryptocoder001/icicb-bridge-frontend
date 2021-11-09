import { createSlice } from '@reduxjs/toolkit';
import networks from './config/networks.json'

const locales = {
    "en-US": require('./locales/en-US.json'),
    "zh-CN": require('./locales/zh-CN.json'),
};

const lang = window.localStorage.getItem('lang') || 'en-US';

const DEFAULT_NET = 'ETH'
const initial:WalletTypes = {
	chainId:networks[DEFAULT_NET].chainId,
    rpc:networks[DEFAULT_NET].rpc,

    status: 'disconnected',
	address: '',
	checking: false,
    balance: '',
    err:'',
}

const tokens:TokenTypes = {}
for(let k in networks) {
	tokens[k] = {
		'-' : {
			symbol: k,
			decimals: networks[k].decimals
		}
	}
}

const initialState: BridgeTypes = {
	lang,
    L: locales[lang],

	tokens, 
	loading: false,
	inited: false,
	pending:{},
	...initial,
	chain: 'ETH',
	targetChain: 'ICICB',
	token: '-',
	value: '',
}

export default createSlice({
	name: 'bridge',
	initialState,
	reducers: {
		update: (state:any, action) => {
			for (const k in action.payload) {
				if (state[k] === undefined) new Error('🦊 undefined account item')
				state[k] = action.payload[k]
			}
		}
	}
})
