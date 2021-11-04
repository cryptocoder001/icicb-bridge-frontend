import React from 'react';
import {Link} from "react-router-dom";
import { useSelector, useDispatch} from 'react-redux';
import bridgeSlice from '../reducer';

/* import imgLang from '../assets/sym-lang.png';

import { DataState } from '../@types/store'; */

const Layout = (props:any) => {
    const G = useSelector((state:BridgeStatus) => state);
	const L = G.L;
	const dispatch = useDispatch();
	const update = (json) => dispatch(bridgeSlice.actions.update(json));

    function changeLang(lang:string){
        update({lang});
    }

    const handleChainChanged = (chainId)=>{
        let {ethereum} = window;
        if(ethereum.isConnected()&&Number(chainId) === 4002){
            onConnect("metamask");
        }
    }

    const checkConnection =async ()=>{
        /* let {ethereum} = window;
        if(ethereum!==undefined){
            const chainId = await ethereum.request({ method: 'eth_chainId' });
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const accounts = await provider.listAccounts();
            if(accounts.length!==0&&Number(chainId) === 4002){
                onConnect("metamask");
            }
            ethereum.on('chainChanged', handleChainChanged);
        } */
    }

    React.useEffect(()=>{
        checkConnection();
    },[])
    
    //connection
    const onConnect = (walletname: string) => {
        /* if(wallet.status!=="connected"){
            wallet.connect().catch((err) => {
                alert("please check metamask!")
            });
        } */
    }

    return (<>
        <header>
            <Link className="title flex middle" to="/">
                <img src="/logo.svg" style={{width:32, height:'auto'}} />
                <span className="h3">ICICB CHAIN</span>
                <span className="badge">ICICB Bridge</span>
            </Link>
        </header>
        <main>
            {props.children}
        </main>
        
        <footer>
            <div>
                <Link to="/">
                    <div>首页</div>
                </Link>
            </div>
        </footer>
    </>);
}

export default Layout;