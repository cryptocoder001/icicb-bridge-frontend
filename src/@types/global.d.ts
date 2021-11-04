declare interface Window  {
    connector: IConnector;
	ethereum: any;
    Web3: any;
}

declare interface BridgeStatus {
    lang: string
    L: {[lang:string]:any}

	network: string,
	coin: string
}