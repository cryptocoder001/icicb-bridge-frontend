import React from 'react'
import { useSelector, useDispatch}	from 'react-redux';
/* import JSBI 						from 'jsbi'; */
import abiIrc20 					from './config/abis/IRC20.json'
import abiBridgeCore 				from './config/abis/BridgeCore.json'
import abiBridge 					from './config/abis/Bridge.json'
import networks 					from './config/networks.json'
import Slice 						from './reducer'
import Web3 						from 'web3'

export const DISCONNECTED= 'disconnected';
export const CONNECTING = 'connecting';
export const CONNECTED 	= 'connected';

export const ZERO = "0x0000000000000000000000000000000000000000"
export const utils = new Web3().utils;
export const toHex = (val: string | number): string => utils.toHex(val)
export const validAddress = (address: string): boolean => utils.isAddress(address)
export const fromEther = (v:number, p?:number) => '0x'+(BigInt(v) * BigInt(10 ** (p || 18))).toString(16)
export const toEther = (v:number|string, p?:number) => Number(BigInt(v) / BigInt(10 ** ((p || 18)-6)))/1e6

const AppKey = process.env.REACT_APP_GTAG || ''

const ERR_INSTALL 		= '🦊 You must install Metamask into your browser: https://metamask.io/download.html'
const ERR_NOACCOUNTS 	= '🦊 No selected address.'
const ERR_UNKNOWN 		= '🦊 Unknown error'
const ERR_ASKCONNECT 	= '🦊 Connect to Metamask using the button on the top right.'
const ERR_CANCELLED 	= '🦊 You cancelled requested operation..'

const useWallet = ():UseWalletTypes => {
	const G = useSelector((state:BridgeTypes)=>state)
	const dispatch = useDispatch()
	const update = (payload:{[key:string]:any}) => dispatch(Slice.actions.update(payload))
	const connected = G.status===CONNECTED;

	/* React.useEffect(() => {
		let timer;
		if (connected) {
			timer = setTimeout(()=>balance(G.token), 5000)
		}
		return ()=>timer && clearTimeout(timer)
	}) */

	React.useEffect(() => {
		const { ethereum } = window
		if (ethereum && connected) {
			/* if (ethereum.isConnected && !connected) {
				_connect();
			} */
			ethereum.on('accountsChanged', accountChanged)
			ethereum.on('chainChanged', chainChanged)
			
		}
	})

	const getPending = () => {
		try {
			const buf = window.localStorage.getItem(AppKey)
			if (buf) {
				return JSON.parse(buf)
			}
		} catch (err) {
			console.log(err)
		}
		return {}
	}

	const setPending = (txId:string, chain:string, targetChain:string, address:string, token:string, value:number) => {
		try {
			let pending = getPending()
			pending[txId] = {chain, targetChain, address, token, value}
			window.localStorage.setItem(AppKey, JSON.stringify(pending))
			
		} catch (err) {
			console.log(err)
		}
	}

	const removePending = (txId:string) => {
		try {
			let pending = getPending()
			delete pending[txId]
			window.localStorage.setItem(AppKey, JSON.stringify(pending))
		} catch (err) {
			console.log(err)
		}
	}

	const _connect = async (accounts?:Array<string>)=>{
		let err = '';
		try {
			const { ethereum } = window
			update({status:CONNECTING, err:''})
			if (ethereum) {
				if (accounts===undefined) accounts = await ethereum.request({method: 'eth_requestAccounts'})
				
				if (accounts && accounts.length) {
					update({status:CONNECTED, address:accounts[0], err:''})
					return
				} else {
					err = ERR_NOACCOUNTS
				}
			} else {
				err = ERR_INSTALL
			}
		} catch (error:any) {
			err = '🦊 ' + error.message
		}
		update({status:DISCONNECTED, address:'', err})
    }
    
	const accountChanged = async (accounts: any) => {
		if (connected) {
			_connect(accounts);
		}
	}

	const chainChanged = async (newChainId) => {
		if (connected) {
			_connect();
		}
	}

    const connect = async (): Promise<void> =>{
		_connect();
    }
    
	const call = async (to:string, abi:any, method:string, args:Array<string|number|boolean>): Promise<any> => {
		try {
			const web3 = new Web3(G.rpc)
			const contract = new web3.eth.Contract(abi, to)
			const res = await contract.methods[method](...args).call()
			return res
		} catch (err:any) {
			update({err:err.message})
		}
		return null
	}

    const send = async (to:string, abi:any, value:string, method:string, args:Array<string|number|boolean>): Promise<string|null> => {
		let err = '';
		try {
			const { ethereum } = window
			if (ethereum && ethereum.isConnected) {
				const web3 = new Web3(ethereum)
				const contract = new web3.eth.Contract(abi, to)
				const data = contract.methods[method](...args).encodeABI()
				const json = {from:G.address, to, value, data}
				const res = await ethereum.request({method: 'eth_sendTransaction', params: [json]})
				if (res) return res
                err = ERR_UNKNOWN
			} else {
                err = ERR_ASKCONNECT
			}
		} catch (error:any) {
			if (error.code===4001) {
				err = ERR_CANCELLED
			} else {
				err = '🦊 ' + error.message
			}
		}
		if (err) update({err})
        return null
	}

    const waitTransaction = async (txId:string): Promise<boolean> => {
		try {
			const web3 = new Web3(G.rpc)
			let repeat = 100
			while (--repeat > 0) {
				const receipt = await web3.eth.getTransactionReceipt(txId)
				if (receipt) {
					const resolvedReceipt = await receipt
					if (resolvedReceipt && resolvedReceipt.blockNumber) {
						return true;
					}
				}
				await new Promise((resolve) => setTimeout(resolve, 3000))
			}
		} catch (err:any) {
			update({err:err.message})
		}
		return false;
	}
	
	const balance = async (token:string): Promise<number|null> => {
		try {
			if (G.address) {
				update({checking:true})
				let balance=0
				const web3 = new Web3(G.rpc)
				if (token==='-') {
					balance = toEther(await web3.eth.getBalance(G.address), networks[G.chain].decimals)
				} else {
					balance = toEther(await call(token, abiIrc20, 'balanceOf', [G.address]), G.tokens[G.chain][token].decimals)
				}
				return balance
			} else {
				update({err:ERR_ASKCONNECT})
			}
		} catch (err:any) {
			update({err:err.message})
		}
		return null
	}
	
	const approval = async (token:string): Promise<number|null> => {
		try {
            if (G.address) {
                return toEther(await call(token, abiIrc20, 'allowance', [G.address, networks[G.chain].bridge]), G.tokens[G.chain][token].decimals);
			} else {
                update({err:ERR_ASKCONNECT})
            }
		} catch (err:any) {
			update({err:err.message})
		}
		return null
	}

    const approve = async (token:string, amount:number): Promise<string|null> => {
		try {
			if (G.address) {
				return await send(token, abiIrc20, '0x0', 'approve', [networks[G.chain].bridge, fromEther(Math.ceil(amount * 1e6), G.tokens[G.chain][token].decimals - 6)])
			} else {
                update({err:ERR_ASKCONNECT})
            }
		} catch (err:any) {
			update({err:err.message})
		}
		return null
	}

	/* const depositToIcicb = async (token:string, amount:string, targetChain:string, targetToken:string): Promise<string|null> => {
		try {
			if (G.address) {
				return await send(networks.ICICB.core, abiBridgeCore, '0x0', 'deposit', [token, amount, targetChain, targetToken])
			} else {
                update({err:ERR_ASKCONNECT})
            }
		} catch (err:any) {
			update({err:err.message})
		}
		return null
	} */

	const deposit = async (token:string, amount:number, targetChain:number): Promise<string|null> => {
		try {
			if (G.address) {
				let value = "";
				if (token===ZERO) {
					value = fromEther(Math.ceil(amount * 1e6), networks[G.chain].decimals - 6)
				} else {
					value = fromEther(Math.ceil(amount * 1e6), G.tokens[G.chain][token].decimals - 6)
				}
				return await send(networks[G.chain].bridge, abiBridge, token===ZERO ? value : '0x0', 'deposit', [token, value, targetChain])
			} else {
                update({err:ERR_ASKCONNECT})
            }
		} catch (err:any) {
			update({err:err.message})
		}
		return null
	}
	return {...G, update, getPending, setPending, removePending, connect, balance, waitTransaction, approval, approve, /* depositToIcicb,  */deposit};
}

export default useWallet
