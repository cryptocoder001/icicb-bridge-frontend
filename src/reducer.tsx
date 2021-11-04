import { createSlice } from '@reduxjs/toolkit';

const locales = {
    "en-US": require('./locales/en-US.json'),
    "zh-CN": require('./locales/zh-CN.json'),
};

const lang = window.localStorage.getItem('lang') || 'zh-CN';



const initialState: BridgeStatus = {
	lang,
    L: locales[lang],

	network: 'ETH',
	coin: 'USDT'
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
