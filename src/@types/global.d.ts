declare interface Window  {
    connector: IConnector;
	ethereum: any;
    Web3: any;
}

interface WalletTypes {
    chainId:number
    rpc:string

    status: string
    address: string
    checking: boolean
    balance: string
	err:string
}

interface TokenTypes {
    [network:string]:{
        [token:string]:{
            symbol: string
            decimals: number
        }
    }
}

interface PendingTypes {
    [txid:string]:{
        chain:string
        targetChain:string
        address:string
        token:string
        value:number
        status?:boolean
    }
}

declare interface BridgeTypes extends WalletTypes {
    lang: string
    L: {[lang:string]:any}

    tokens: TokenTypes
    loading: boolean
    inited: boolean
    pending: PendingTypes
    chain: string
    targetChain: string
	token: string
    value: string
}

interface UseWalletTypes extends BridgeTypes {
    update(payload:{[key:string]:string|number|boolean})

    getPending()
    setPending(txId:string, chain:string, targetChain:string, address:string, token:string, value:number)
    removePending(txId:string)

    balance(token:string):Promise<number|null>
    connect():Promise<void>

    waitTransaction(txId:string): Promise<boolean>
    
    approval(token:string): Promise<number|null>
    approve(token:string, amount:number): Promise<string|null>

    /* depositToIcicb(token:string, amount:string, targetChain:string, targetToken:string): Promise<string|null> */
    deposit(token:string, amount:number, targetChain:number): Promise<string|null>
}

declare type CallbackAccountsChanged = (address:string)=>void
declare type CallbackChainChanged = (chainid:number)=>void
