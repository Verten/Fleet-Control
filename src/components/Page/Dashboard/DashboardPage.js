/**
 * Created by ebinhon on 3/22/2016.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import FaSpinner from "react-icons/fa/spinner";
import { GoogleMapLoader,GoogleMap, Marker, DirectionsRenderer,Polyline } from "react-google-maps";
import ScriptjsLoader from "react-google-maps/lib/async/ScriptjsLoader";
import Page from '../Page';
import TripInfoStore from '../../../Store/TripInfoStore';
import TripInfoAction from '../../../Action/TripInfoAction';
import AppInfoStore from '../../../Store/AppInfoStore';
import SensorInfoStore from '../../../Store/SensorInfoStore';
import SensorInfoAction from '../../../Action/SensorInfoAction';
import EventInfoStore from '../../../Store/EventInfoStore';
import EventInfoAction from '../../../Action/EventInfoAction';
import connectToStores from 'alt-utils/lib/connectToStores';
import Table from '../../Table/Table';
import Panel from '../../Panel/Panel';
import './Dashboard.scss';

@connectToStores
export default class DashboardPage extends React.Component {
    static propTypes = {
        //React.PropTypes.string.isRequired,
        //React.PropTypes.bool,
        //React.PropTypes.object,
        //React.PropTypes.oneOf(['value1', 'value2'])
        //reference to official URL: https://facebook.github.io/react/docs/reusable-components.html
        tripId: React.PropTypes.string.isRequired,
        markers: React.PropTypes.arrayOf(React.PropTypes.object)
    }

    static defaultProps = {
        tripId: "",
        markers: [
            {
                position: {
                    lat: 23.1312183,
                    lng: 113.27067570000001
                },
                key: `Start`,
                defaultAnimation: 2
            },
            {
                position: {
                    lat: 23.1312983,
                    lng: 113.23067570006001
                },
                key: `End`,
                defaultAnimation: 2
            }
        ],
        origin: new google.maps.LatLng(23.1312183, 113.27067570000001),
        destination: new google.maps.LatLng(23.1312983, 113.23067570006001)
    }
    static version = Math.ceil(Math.random() * 22);

    constructor() {
        super();
        this.state = {
            tripId: "",
            trip: null,
            directions: null
        }
    }

    static getStores() {
        // this will handle the listening/unlistening for you
        return [AppInfoStore, TripInfoStore, EventInfoStore, SensorInfoStore];
    }

    static getPropsFromStores(props) {
        // this is the data that gets passed down as props
        // each key in the object returned by this function is added to the `this.props`
        let app_info = AppInfoStore.getState().body;
        let trip_info = TripInfoStore.getState().trips;
        let trip = TripInfoStore.findTripById(props.params.tripId);

        //default locate GuangZhou
        let startPoint_latitude = 23.1312183;
        let startPoint_longitude = 113.27067570000001;
        let destination_latitude = 23.1312983;
        let destination_longitude = 113.23067570006001;

        if (trip && trip.route) {
            startPoint_latitude = trip.route.startPoint.latitude;
            startPoint_longitude = trip.route.startPoint.longitude;
            destination_latitude = trip.route.destination.latitude;
            destination_longitude = trip.route.destination.longitude;
        }

        return {
            app_info: app_info,
            trip_info: trip_info,
            trip: TripInfoStore.findTripById(props.params.tripId),
            origin: new google.maps.LatLng(parseFloat(startPoint_latitude), parseFloat(startPoint_longitude)),
            destination: new google.maps.LatLng(parseFloat(destination_latitude), parseFloat(destination_longitude))
        }
    }

    componentDidMount() {
        //send ajax to get events and sensor

        if (this.props.trip) {
            //get exists route
            const DirectionsService = new google.maps.DirectionsService();
            DirectionsService.route({
                origin: this.props.origin,
                destination: this.props.destination,
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

    componentWillMount() {

    }

    expandJSONObject(jsonObject) {
        let keys = [];
        for (let key in jsonObject) {
            keys.push(
                key
            );
        }
        return keys;
    }

    initVehiclePanel() {
        let items = [];
        //registration, brand, model
        console.log("init vehicle panel");
        if (this.props.trip && this.props.trip.vehicle) {
            items.push({
                "label": "Registration",
                "value": this.props.trip.vehicle.registration,
                "editable":false
            });
            items.push({
                "label":"Brand",
                "value": this.props.trip.vehicle.brand,
                "editable":false
            });
            items.push({
                "label":"Model",
                "value": this.props.trip.vehicle.model,
                "editable":false
            });
        } else {
            items.push({
                "label": "Registration",
                "value": "",
                "editable":false
            });
            items.push({
                "label":"Brand",
                "value": "",
                "editable":false
            });
            items.push({
                "label":"Model",
                "value": "",
                "editable":false
            });
        }
        return items;
    }

    initDriverPanel() {
        let items = [];
        //registration, brand, model
        console.log("init driver panel");
        if (this.props.trip && this.props.trip.vehicle && this.props.trip.vehicle.driver) {
            let driver_id = this.expandJSONObject(this.props.trip.vehicle.driver)[0];
            items.push({
                "label":"Name",
                "value": this.props.trip.vehicle.driver[driver_id].firstName + " " + this.props.trip.vehicle.driver[driver_id].lastName,
                "editable":false
            });
            items.push({
                "label":"Phone",
                "value": this.props.trip.vehicle.driver[driver_id].phoneNumber,
                "editable":false
            });
        } else {
            items.push({
                "label":"Name",
                "value": "",
                "editable":false
            });
            items.push({
                "label":"Phone",
                "value": "",
                "editable":false
            });
        }
        return items;
    }

    initPickUpPanel() {
        let items = [];
        console.log("init Pick-up panel");
        if (this.props.trip) {
            items.push({
                "label":"Date & time",
                "value": this.props.trip.plannedStartTime,
                "editable":false
            });
            items.push({
                "label":"Actual",
                "value": this.props.trip.actualStartTime,
                "editable":false
            });
            items.push({
                "label":"Location",
                "value": this.props.trip.route.startPoint.address,
                "editable":false
            });
            items.push({
                "label":"Load",
                "value" : this.props.trip.cargo.name,
                "editable":false
            });
        } else {
            items.push({
                "label":"Date & time",
                "value": "",
                "editable":false
            });
            items.push({
                "label":"Actual",
                "value": "",
                "editable":false
            });
            items.push({
                "label":"Location",
                "value": "",
                "editable":false
            });
            items.push({
                "label":"Load",
                "value" : "",
                "editable":false
            });
        }
        return items;
    }

    initDropOffPanel() {
        let items = [];
        console.log("init drop-off panel");
        if (this.props.trip) {
            items.push({
                "label" : "Date & time",
                "value": this.props.trip.plannedArriveTime,
                "editable":false
            });
            items.push({
                "label":"Actual",
                "value":this.props.trip.actualArriveTime,
                "editable":false
            });
            items.push({
                "label":"Location",
                "value": this.props.trip.route.destination.address,
                "editable":false
            });
        } else {
            items.push({
                "label": "Date & time",
                "value" : "",
                "editable":false
            });
            items.push({
                "label" : "Actual",
                "value ": "",
                "editable":false
            });
            items.push({
                "label" : "Location",
                "value":"",
                "editable":false
            });
        }
        return items;
    }

    render() {
        let vehicle_panel_content = this.initVehiclePanel();
        let driver_panel_content = this.initDriverPanel();
        let pickup_panel_content = this.initPickUpPanel();
        let dropoff_panel_content = this.initDropOffPanel();
        let empty = [];
        const directions = this.state.directions;
        return (
            <Page>
                <div className="vehicle_driver">
                    <div className="vehicle_panel">
                        <Panel title="Vehicle" data={vehicle_panel_content}/>
                    </div>
                    <div className="driver_panel">
                        <Panel title="Driver" data={driver_panel_content}/>
                    </div>
                </div>
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
                        <div className="map_panel"></div>
                    }
                    googleMapElement={
                        <GoogleMap
                          defaultZoom={13}
                          defaultCenter={this.props.origin}
                        >
                        {directions ? <DirectionsRenderer directions={directions} /> : null}
                        </GoogleMap>
                    }
                />
                <div className="detail_panel">
                    <Panel title="Assignment details" data={empty}>
                        <div className="trip_detail_panel">
                            <div className="pickup_panel">
                                <Panel title="PICK-UP" data={pickup_panel_content}/>
                            </div>
                            <div className="dropdown_panel">
                                <Panel title="DROP-OFF" data={dropoff_panel_content}/>
                            </div>
                        </div>
                        <div className="sensors_detail_panel">
                            <Panel title="Temperature (Celsius)" data={empty}/>
                            <Panel title="Humidity (Relative)" data={empty}/>
                        </div>
                    </Panel>
                </div>
                <div className="event_panel">
                    <Table header={["Event","Time"]} data={empty}/>
                </div>
            </Page>
        );
    }
}