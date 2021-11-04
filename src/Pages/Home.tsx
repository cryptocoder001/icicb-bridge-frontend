import React from 'react';
import { useSelector, useDispatch} from 'react-redux';
import bridgeSlice from '../reducer';

import Layout from '../components/Layout';
import networks from '../config/networks.json'

interface HomeStatus {
	isBuy: boolean
	query: string
	token: string
}


const Home = () => {
	const G = useSelector((state:BridgeStatus) => state);
	const L = G.L;
	const dispatch = useDispatch();
	const update = (json) => dispatch(bridgeSlice.actions.update(json));

	const refMenu = React.useRef<HTMLUListElement>(null)
	const refList = React.useRef<HTMLInputElement>(null)

	const [status, setStatus] = React.useState<HomeStatus>({
		isBuy: true,
		query: '',
		token: ''
	})

	const updateStatus = (json) => setStatus({...status, ...json});

	const onChangeNetwork = (network:string)=>{
		update({network})
		if (refMenu && refMenu.current) {
			refMenu.current.style.display = 'none'
			setTimeout(()=>{
				if (refMenu && refMenu.current) refMenu.current.style.display = ''
			}, 100)
		}
	};
	const onChangeQuery = (query:string)=>{
		updateStatus({query})
	};
	const onChangeToken = (token:string)=>{
		updateStatus({token})
		if (refList && refList.current) {
			refList.current.checked = false
		}
	};
	const ViewNetwork = (network) => {
		return (network==='icicb') ? (
			<div className="chain flex">
				<img className="icon" src="/logo.svg" alt="icicb"  />
				<div style={{marginTop:10}}>ICICB network</div>
			</div>
		) : (
			<div className="chain">
				<img className="icon" src={`/networks/${G.network}.svg`}  alt={G.network}/>
				<div className="flex" style={{marginTop:10}}>
					<div className="fill">{networks[G.network].title}</div>
					<div>
						<div className="menu">
							<i><span className="ic-down"></span></i>
							<ul ref={refMenu} className={status.isBuy?'':' right'}>
								{Object.keys(networks).map(k=>
									<li className={!!networks[k].disabled?'disabled':''} key={k}  onClick={()=>onChangeNetwork(k)}>
										<img className="icon" src={`/networks/${k}.svg`} alt="eth"/>
										<span>{networks[k].title}</span>
									</li>
								)}
							</ul>
						</div>
					</div>
				</div>
			</div>
		);
	}
	const allTokens = networks[G.network].tokens
	const query = status.query.toLowerCase();
	const tokens:Array<{icon:string, coin:string, label:string}> = [];
	let defaultToken = '';
	for(let k in allTokens) {
		const v = allTokens[k]
		if (defaultToken==='') defaultToken = k;
		if (query!=='' && k.toLowerCase().indexOf(query)===-1 && v.coin.toLowerCase().indexOf(query)===-1) continue;
		tokens.push({icon:k, coin:v.coin, label:v.label})
	}
	const token =  allTokens[status.token]===undefined ? defaultToken : status.token

	return <Layout className="home">
		<section>
			<div className="c4 o1-md">
				<div className="panel">
					<h1 className="gray">ICICB Bridge</h1>
					<p className="gray">The safe, fast and most secure way to bring cross-chain assets to ICICB chains.</p>
					<div className="mt4 mb-3"><a href="" className="button">Introduction video</a></div>
					<p><a className="cmd" href="">View Proof of Assets</a></p>
					<p><a className="cmd" href="">User Guide</a></p>
					<div className="hide-md" style={{marginTop:20}}>
						<img src="/logo.svg" alt="logo" style={{width:'100%', opacity:0.3}} />
					</div>
				</div>
			</div>
			<div className="c ml3-md">
				<div className="panel swap">
					<div className="flex" style={{paddingTop:20}}>
						<div className="c">
							{ViewNetwork(status.isBuy ? G.network : 'icicb')}
						</div>
						<div className="flex middle center" style={{paddingLeft:20, paddingRight:20}}>
							<button className="button switch" onClick={()=>updateStatus({isBuy:!status.isBuy})}>
								<svg fill="white" width="18" viewBox="0 0 18 18"><path d="M10.47 1L9.06 2.41l5.1 5.1H0V9.5h14.15l-5.09 5.09L10.47 16l7.5-7.5-7.5-7.5z"></path></svg>
							</button>
						</div>
						<div className="c">
							{ViewNetwork(!status.isBuy ? G.network : 'icicb')}
						</div>
					</div>
					<div className="label" style={{paddingTop:50}}>Asset</div>
					<div className="asset">
						<input ref={refList} id="asset" type="checkbox" style={{display:'none'}} />
						<label className="asset" htmlFor="asset">
							<div className="flex">
								<img src={`/coins/${token}.svg`} style={{width:20, height:20, marginRight:10}} />
								<span>{allTokens[token].coin} <small>({allTokens[token].label})</small></span>
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
							<div style={{overflowY:'auto', maxHeight:200}}>
								<ul>
									{tokens.map(v=>(
										<li key={v.icon} onClick={()=>onChangeToken(v.icon)}>
											<img src={`/coins/${v.icon}.svg`} loading='lazy' style={{width:20, height:20, marginRight:10}} alt={v.icon} />
											<span>{v.coin}</span>
											<small>{v.label}</small>
										</li>
									))}
								</ul>
							</div>
							
						</div>
						
						<label className="overlay" htmlFor="asset"></label>
					</div>
					<p className="gray">If you have not add ICICB Chain network in your MetaMask yet, please click <a className="cmd">Add network</a> and continue</p>
					<div className="label" style={{paddingTop:20}}>Amount</div>
					<div>
						<input className="amount" type="number" />
					</div>
					<p className="gray">You will receive ≈ 0 USDT IEP20</p>
					<div style={{paddingTop:20}}>
						<button className="primary full">Connect wallet</button>
					</div>
				</div>
			</div>
		</section>
	</Layout>;
};

export default Home;