import React from 'react';
import Layout from '../components/Layout';
import networks from '../config/networks.json'
/* import config from '../config/contracts.json' */
import useWallet, {CONNECTED, CONNECTING, ZERO, toEther} from '../useWallet';

interface HomeStatus {
	query: string
	submitLabel: string
	loading:boolean
}
const getApiUrl = (uri) => process.env.REACT_APP_ENDPOINT + uri;

const Home = () => {
	const G = useWallet();
	const L = G.L;
	console.log('status', G.status)
	
	const refMenu = React.useRef<HTMLUListElement>(null)
	const refList = React.useRef<HTMLInputElement>(null)
	const refAmount = React.useRef<HTMLInputElement>(null)

	const [status, setStatus] = React.useState<HomeStatus>({
		submitLabel:'',
		loading:false,
		query: '',
	})
	const updateStatus = (json) => setStatus({...status, ...json});
	const pending = Object.keys(G.pending);
	const erc20 = networks[G.chain].erc20;
	const query = status.query.toLowerCase();
	const tokens = G.tokens[G.chain];
	const tokenArray:Array<string> = ['-'];
	for(let k in tokens) {
		if (k==='-') continue;
		if (query!=='' && k.toLowerCase().indexOf(query)===-1) continue
		tokenArray.push(k)
	}
	const token =  tokens[G.token]===undefined ? '-' : G.token
	let loading = G.status===CONNECTING || status.loading;

	React.useEffect(()=>{
		try {
			if (!G.inited && !G.loading) {
				console.log("fetch")
				G.update({loading:true})
				fetch(getApiUrl('all-tokens')).then(data=>data.json()).then(tokens=>{
					G.update({tokens, pending:G.getPending(), inited:true, loading:false})
				}).catch(reason=>{
					G.update({loading:false, err:reason})
				})
			}
		} catch (error) {
			console.log(error)
		}
	}, [])

	const onChangeNetwork = (chain:string)=>{
		const net = networks[chain];
		const chainId = net.chainId;
		const rpc = net.rpc;
		G.update({[G.targetChain==='ICICB' ? 'chain' : 'targetChain']:chain, chainId, rpc})
		
		if (refMenu && refMenu.current) {
			refMenu.current.style.display = 'none'
			setTimeout(()=>{
				if (refMenu && refMenu.current) refMenu.current.style.display = ''
			}, 100)
		}
	};
	const swapChains = () => {
		const net = networks[G.targetChain];
		const chainId = net.chainId;
		const rpc = net.rpc;
		G.update({chain:G.targetChain, targetChain:G.chain, chainId, rpc})
	}
	const onChangeQuery = (query:string)=>{
		updateStatus({query})
	};
	const onChangeToken = (token:string)=>{
		G.update({token})
		if (refList && refList.current) {
			refList.current.checked = false
		}
	};
	const onChangeValue = (value:string)=>{
		G.update({value})
	};
	const submit = async ()=>{
		console.log(G.status)
		if (G.status===CONNECTED) {
			const value = Number(G.value)
			if (value>0) {
				G.update({err:''})
				updateStatus({loading:true, submitLabel:'checking balance...'})
				const balance = await G.balance(G.token)
				if (balance!==null) {
					if (balance>=value) {
						let success = true;
						console.log('balance', balance)
						if (G.token!=='-') {
							updateStatus({loading:true, submitLabel:'checking allowance...'})
							const approval = await G.approval(G.token);
							if (approval!==null) {
								const decimals = tokens[G.token].decimals
								console.log('approval', approval, 'decimals', decimals)
								if (approval<value) {
									updateStatus({loading:true, submitLabel:'allow brige contract ...'})
									let tx = await G.approve(G.token, value);
									if (tx!==null) {
										await G.waitTransaction(tx)
									} else {
										success = false;
									}
								}
							} else {
								success = false
							}
						}
						if (success) {
							updateStatus({loading:true, submitLabel:'exchanging...'})
							const tx = await G.deposit(G.token==='-' ? ZERO : G.token, value, G.chain==='ICICB' ? 0 : networks[G.chain].chainId)
							if (tx!==null) {
								updateStatus({loading:true, submitLabel:'confirming...'})
								G.setPending(tx, G.chain, G.targetChain, G.address, G.token==='-' ? G.chain : G.tokens[G.chain][G.token].symbol, Number(value))
								G.update({pending:G.getPending()})
								await G.waitTransaction(tx)
							}
						}
					} else {
						G.update({err:'no enough balance'})
					}
					updateStatus({loading:false})
				}
			} else if (refAmount?.current) {
				refAmount.current.focus()
			}
		} else {
			updateStatus({submitLabel:'Connecting...'})
			G.connect()
		}
	};

	const ViewNetwork = (chain) => {
		return (chain==='ICICB') ? (
			<div className="chain flex">
				<img className="icon" src="/logo.svg" alt="icicb"  />
				<div style={{marginTop:10}}>{L['chain.icicb']}</div>
			</div>
		) : (
			<div className="chain">
				<img className="icon" src={`/networks/${chain}.svg`}  alt={chain}/>
				<div className="flex" style={{marginTop:10}}>
					<div className="fill">{L['chain.' + chain.toLowerCase()]}</div>
					<div>
						<div className="menu">
							<i><span className="ic-down"></span></i>
							<ul ref={refMenu} className={G.chain==='ICICB' ? 'right' : ''} style={{width:150}}>
								{Object.keys(networks).map(k=>
									k==='ICICB' ? null : (<li className={!!networks[k].disabled ? 'disabled' : ''} key={k}  onClick={()=>!!networks[k].disabled ? null : onChangeNetwork(k)}>
										<img className="icon" src={`/networks/${k}.svg`} alt="eth"/>
										<span>{L['chain.' + k.toLowerCase()]}</span>
									</li>)
								)}
							</ul>
						</div>
					</div>
				</div>
			</div>
		);
	}
	

	return <Layout className="home">
		<section>
			<div className="c4 o1-md">
				<div className="panel">
					<h1 className="gray">{L['bridge']}</h1>
					<p className="gray">{L['description']}</p>
					<div className="mt4 mb-3"><a href="/" className="button">Introduction video</a></div>
					<p><a className="cmd" href="/">View Proof of Assets</a></p>
					<p><a className="cmd" href="/">User Guide</a></p>
					<div className="hide-md" style={{marginTop:20}}>
						<img src="/logo.svg" alt="logo" style={{width:'100%', opacity:0.3}} />
					</div>
				</div>
			</div>
			<div className="c ml3-md">
				<div className="panel swap">
					<div className="flex">
						<div className="c">
							{ViewNetwork(G.chain)}
						</div>
						<div className="flex middle center" style={{paddingLeft:20, paddingRight:20}}>
							<button className="button switch" onClick={()=>swapChains()}>
								<svg fill="white" width="18" viewBox="0 0 18 18"><path d="M10.47 1L9.06 2.41l5.1 5.1H0V9.5h14.15l-5.09 5.09L10.47 16l7.5-7.5-7.5-7.5z"></path></svg>
							</button>
						</div>
						<div className="c">
							{ViewNetwork(G.targetChain)}
						</div>
					</div>
					<div className="label" style={{paddingTop:30}}>Asset</div>
					<div className="asset">
						<input ref={refList} id="asset" type="checkbox" style={{display:'none'}} />
						<label className="asset" htmlFor="asset">
							<div className="flex">
								<img src={token==='-' ? `/networks/${G.chain}.svg` : `/coins/${tokens[token].symbol}.svg`} style={{width:20, height:20, marginRight:10}} alt={token} />
								<span>{token==='-' ? G.chain : tokens[token].symbol} <small>({token==='-' ? L['token.native'] : erc20})</small></span>
							</div>
							<div>
								<svg width="11" fill="#888" viewBox="0 0 11 11"><path d="M6.431 5.25L2.166 9.581l.918.919 5.25-5.25L3.084 0l-.918.919L6.43 5.25z"></path></svg>
							</div>
						</label>
						
						<div className="list">
							<div className="search">
								<svg width="24" height="24" fill="#5e6673" viewBox="0 0 24 24"><path d="M3 10.982c0 3.845 3.137 6.982 6.982 6.982 1.518 0 3.036-.506 4.149-1.416L18.583 21 20 19.583l-4.452-4.452c.81-1.113 1.416-2.631 1.416-4.149 0-1.922-.81-3.643-2.023-4.958C13.726 4.81 11.905 4 9.982 4 6.137 4 3 7.137 3 10.982zM13.423 7.44a4.819 4.819 0 011.416 3.441c0 1.315-.506 2.53-1.416 3.44a4.819 4.819 0 01-3.44 1.417 4.819 4.819 0 01-3.441-1.417c-1.012-.81-1.518-2.023-1.518-3.339 0-1.315.506-2.53 1.416-3.44.911-1.012 2.227-1.518 3.542-1.518 1.316 0 2.53.506 3.44 1.416z"></path></svg>
								<input type="text" value={status.query} maxLength={6} onChange={(e)=>onChangeQuery(e.target.value.trim())} />
							</div>
							<div style={{overflowY: 'auto', maxHeight: 200, boxShadow: '0 3px 5px #000'}}>
								<ul>
									{tokenArray.map(k=>
										<li key={k} onClick={()=>onChangeToken(k)}>
											<img src={k==='-' ? `/networks/${G.chain}.svg` : `/coins/${tokens[k].symbol}.svg`} loading='lazy' style={{width:20, height:20, marginRight:10}} alt={tokens[k].symbol} />
											<span>{k==='-' ? G.chain : tokens[k].symbol}</span>
											<small>{k==='-' ? L['token.native'] : erc20}</small>
										</li>
									)}
								</ul>
							</div>
						</div>
						<label className="overlay" htmlFor="asset"></label>
					</div>
					<p className="gray">If you have not add ICICB Chain network in your MetaMask yet, please click <span className="cmd">Add network</span> and continue</p>
					<div className="label" style={{paddingTop:20}}>Amount</div>
					<div>
						<input ref={refAmount} className="amount" type="number" value={G.value} onChange={(e)=>onChangeValue(e.target.value)} />
					</div>
					{G.value!=='' ? (
						<p className="gray">You will receive ≈ {G.value} {token==='-' ? G.chain : tokens[token].symbol} <small>({networks[G.targetChain].erc20})</small></p>
					) : null}
					<div style={{paddingTop:20}}>
						<button disabled={loading} className="primary full" onClick={submit}>
							{loading ? (
								<div className="flex middle">
									<div style={{width:'1.5em'}}>
										<div className="loader">Loading...</div>
									</div>
									<div>{status.submitLabel}</div>
								</div>) : (G.status===CONNECTED ? 'SUBMIT' : 'Connect wallet')
							}
						</button>
						{G.err ? (
							<p style={{color:'red', backgroundColor: '#2b2f36', padding: 10}}>{G.err}</p>
						) : (
							<p style={{color:'#35ff35'}}>{G.address ? 'Your wallet: ' + G.address.slice(0,10) + '...' + G.address.slice(-4) : ''}</p>
						)}
					</div>
					{pending.length ? (
						<div style={{paddingTop:20}}>
							<p><b>Your pending transactions:</b></p>
							{pending.map(k=>(
								<div key={k}>
									<a className="cmd" href={networks[G.pending[k].chain].explorer + '/tx/' + k} target="_blank">
										<code>{k.slice(0,10) + '...' + k.slice(-4) + ' ' + G.pending[k].token + ' ' + G.pending[k].value + ' ['}</code>
										<i>{G.pending[k].chain + ' ' + ' To ' + G.pending[k].targetChain}</i>
										<span>] </span>
										<code style={{color:G.pending[k].status ? 'lightgreen' : 'red'}}>({G.pending[k].status ? 'success' : 'pending'})</code>
									</a>
								</div>
							))}
						</div>
					) : null}
				</div>
			</div>
		</section>
	</Layout>;
};

export default Home;