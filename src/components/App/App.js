/**
 * Created by ebinhon on 2/29/2016.
 */
import React from 'react';
import { Link } from 'react-router';
import AppInfoStore from '../../Store/AppInfoStore';
import AppInfoAction from '../../Action/AppInfoAction';
import Navigation from '../Navigation/Navigation';
import connectToStores from 'alt-utils/lib/connectToStores';


@connectToStores
export default class App extends React.Component{
    constructor(){
        super();
        this.state = {
            loadFlag:false,
            loadError:false,
            fleetId:""
        };
    }

    static getStores() {
        // this will handle the listening/unlistening for you
        return [AppInfoStore];
    }

    static getPropsFromStores() {
        // this is the data that gets passed down as props
        // each key in the object returned by this function is added to the `this.props`
        let app_info = AppInfoStore.getState().body;
        return {
            app_info: app_info
        }
    }


    componentDidMount() {
        //get users endpoint and get user information, like fleetId and enterpriseId
        const users_Endpoint = AppInfoStore.getClientEndpoint("users");
        //for remote dev: should add "http://ec2-52-58-27-100.eu-central-1.compute.amazonaws.com/"
        AppInfoAction.loadData("http://ec2-52-58-27-100.eu-central-1.compute.amazonaws.com" + users_Endpoint + "setupClientContext").then((response) =>{
            console.log("get setupClientContext successfully")
            console.log(this.props.app_info);
            this.setState({
                loadFlag:true,
                fleetId:this.props.app_info.fleetId
            });
        }).catch((error) =>{
            console.log("Loading setupClientContext API Error!");
            console.log(error);
            this.setState({
                loadError:true
            });
        });
    }

    componentWillMount(){
    }

    changeLink(){
        console.log("change link flag")
        AppInfoStore.setChangeLinkFlag();
    }

    render(){
        let links = [
            {
                name: "Create",
                path:"/create/",
                param: this.state.fleetId ? this.state.fleetId : "no fleet Id"
            },
            {
                name: "Back",
                path:"/",
                param: ""
            }
        ];
        return (
            <div className="main_page" >
                <Navigation clickFunction={this.changeLink.bind(this)} ref="navigation" links={links} />
                {this.props.children}
            </div>
        );
    }
}