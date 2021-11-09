/* import React from 'react'; */
import {Link} from "react-router-dom";
import { useSelector/* , useDispatch */} from 'react-redux';
/* import bridgeSlice from '../reducer'; */

/* import imgLang from '../assets/sym-lang.png';

import { DataState } from '../@types/store'; */

const Layout = (props:any) => {
    const G = useSelector((state:BridgeTypes) => state);
	const L = G.L;
	/* const dispatch = useDispatch();
	const update = (json) => dispatch(bridgeSlice.actions.update(json)); */

    /* function changeLang(lang:string){
        update({lang});
    }

    const handleChainChanged = (chainId)=>{
        let {ethereum} = window;
        if(ethereum.isConnected()&&Number(chainId) === 4002){
            onConnect("metamask");
        }
    } */

    return (<>
        <header>
            <Link className="title flex middle" to="/">
                <img src="/logo.svg" style={{width:32, height:'auto'}} alt="logo" />
                <span className="h3">{L['chain']}</span>
                <span className="badge">{L['bridge']}</span>
            </Link>
        </header>
        <main>
            {props.children}
        </main>
        
        <footer>
        </footer>
    </>);
}

export default Layout;