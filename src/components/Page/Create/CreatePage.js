/**
 * Created by ebinhon on 3/21/2016.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import FaSpinner from "react-icons/fa/spinner";
import { GoogleMapLoader,GoogleMap, Marker, DirectionsRenderer,Polyline } from "react-google-maps";
import ScriptjsLoader from "react-google-maps/lib/async/ScriptjsLoader";
import Table from '../../Table/Table';
import AppInfoStore from '../../../Store/AppInfoStore';
import GeoLocationInfoAction from '../../../Action/GeoLocationInfoAction';
import GeoLocationInfoStore from '../../../Store/GeoLocationInfoStore';
import Page from '../Page';
import Panel from '../../Panel/Panel';
import moment from 'moment';

import connectToStores from 'alt-utils/lib/connectToStores';

@connectToStores
export default class CreatePage extends React.Component {

    static getStores() {
        // this will handle the listening/unlistening for you
        return [AppInfoStore, GeoLocationInfoStore];
    }

    static getPropsFromStores() {
        // this is the data that gets passed down as props
        // each key in the object returned by this function is added to the `this.props`
        let app_info = AppInfoStore.getState().body;
        let geoLocationStatus = GeoLocationInfoStore.getState().status;
        let geoLocationResult = GeoLocationInfoStore.getState().results;
        return {
            app_info: app_info,
            geoLocationStatus: geoLocationStatus,
            geoLocationResult: geoLocationResult
        }
    }

    static propTypes = {
        //React.PropTypes.string.isRequired,
        //React.PropTypes.bool,
        //React.PropTypes.object,
        //React.PropTypes.oneOf(['value1', 'value2'])
        //reference to official URL: https://facebook.github.io/react/docs/reusable-components.html
        origin: React.PropTypes.object,
        destination: React.PropTypes.object
    }

    static defaultProps = {
        origin: new google.maps.LatLng(23.1312183, 113.27067570000001),
        destination: new google.maps.LatLng(23.1312983, 113.23067570006001)
    }

    constructor() {
        super();
        this.state = {
            origin: null,
            destination: null,
            directions: null,
            plannedStartTime: null,
            plannedArriveTime: null,
            startPoint_address: null,
            destination_address: null
        }
    }


    componentDidMount() {
        console.log('Created "create page"');
    }

    initPickUpPanel() {
        let items = [];
        console.log("init Pick-up panel");
        items.push({
            "label": "Date & time",
            "value": "",
            "type": "plannedStartTime",
            "editable": true
        });
        items.push({
            "label": "Location",
            "value": "",
            "type": "startPoint_address",
            "editable": true
        });
        items.push({
            "label": "Load",
            "value": "",
            "type": "cargo_name",
            "editable": true
        });
        return items;
    }

    initDropOffPanel() {
        let items = [];
        console.log("init Drop-off panel");
        items.push({
            "label": "Date & time",
            "value": "",
            "type": "plannedArriveTime",
            "editable": true
        });
        items.push({
            "label": "Location",
            "value": "",
            "type": "destination_address",
            "editable": true
        });
        return items;
    }

    blurFunction(value, type) {
        console.log(type + " : " + value);
        if (type == "startPoint_address" || type == "destination_address" && (value != "")) {
            GeoLocationInfoAction.loadData("https://maps.googleapis.com/maps/api/geocode/json?address=" + value).then(
                (response) => {
                    if (this.props.geoLocationStatus == "OK") {
                        console.log("get geolocation successfully");
                        //get geo location
                        let geoLocation = this.props.geoLocationResult[0].geometry.location;
                        if (type == "startPoint_address") {
                            this.setState({
                                origin: new google.maps.LatLng(geoLocation.lat, geoLocation.lng),
                                startPoint_address: value
                            });
                        } else if (type == "destination_address") {
                            this.setState({
                                destination: new google.maps.LatLng(geoLocation.lat, geoLocation.lng),
                                destination_address: value
                            });
                        }
                    } else {
                        console.log("get geolocation failed");
                    }
                    if (this.state.origin && this.state.destination) {
                        console.log("draw directions");
                        const DirectionsService = new google.maps.DirectionsService();
                        DirectionsService.route({
                            origin: this.state.origin,
                            destination: this.state.destination,
                            travelMode: google.maps.TravelMode.DRIVING,
                        }, (result, status) => {
                            if (status === google.maps.DirectionsStatus.OK) {
                                this.setState({
                                    directions: result
                                });
                            } else {
                                console.error(`error fetching directions ${ result }`);
                            }
                        });
                    }
                }
            ).catch(
                (error) => {
                    console.log(error);
                }
            );
        } else {
            if (type == "startPoint_address") {
                this.setState({
                    startPoint_address: value
                });
            }
            if (type == "destination_address") {
                this.setState({
                    destination_address: value
                });
            }
        }
    }

    handleDate = (type, newDate) => {//newDate is a moment object
        console.log("newDate", newDate);
        console.log("type" + type);
        let date = newDate.format("YYYY-MM-DD HH:mm:ss");
        if (type == "plannedStartTime") {
            this.setState({
                plannedStartTime: date
            });
        }
        if (type == "plannedArriveTime") {
            this.setState({
                plannedArriveTime: date
            });
        }
    }

    render() {
        console.log(this.state);
        let empty = [];
        let pickup_panel_content = this.initPickUpPanel();
        let drop_off_content = this.initDropOffPanel();
        let directions = this.state.directions;
        return (
            <Page>
                <GoogleMapLoader
                    loadingElement={
                        <div style={{
                              height: `100%`
                            }}>
                          <FaSpinner  style={{
                                                display: `block`,
                                                width: 100,
                                                height: 100,
                                                margin: `60px auto`,
                                                animation: `fa-spin 2s infinite linear`
                                            }}
                          />
                        </div>
                    }
                    containerElement={
                        <div className="map_panel" style={{ margin: `15px auto`}}></div>
                    }
                    googleMapElement={
                        <GoogleMap
                          defaultZoom={13}
                          defaultCenter={this.state.origin? this.state.origin : this.props.origin}
                          center={this.state.origin? this.state.origin : this.props.origin}
                        >
                        {directions ? <DirectionsRenderer directions={directions} /> : null}
                        </GoogleMap>
                    }
                />

                <div className="detail_panel">
                    <Panel title="Assignment details" data={empty}>
                        <div className="trip_detail_panel">
                            <div className="pickup_panel">
                                <Panel title="PICK-UP" data={pickup_panel_content}
                                       handleDate={this.handleDate.bind(this)}
                                       blurFunction={this.blurFunction.bind(this)}>
                                </Panel>
                            </div>
                            <div className="dropdown_panel">
                                <Panel title="DROP-OFF" data={drop_off_content} handleDate={this.handleDate.bind(this)}
                                       blurFunction={this.blurFunction.bind(this)}/>
                            </div>
                        </div>
                        <div className="sensors_detail_panel">
                            <Panel title="Temperature (Celsius)" data={empty}/>
                            <Panel title="Humidity (Relative)" data={empty}/>
                        </div>
                    </Panel>
                </div>

                {this.props.params.fleetId}
            </Page>
        );
    }
}