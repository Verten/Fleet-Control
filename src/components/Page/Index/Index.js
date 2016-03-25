/**
 * Created by ebinhon on 3/2/2016.
 */
import React from 'react';
import Page from '../Page';
import FaSpinner from "react-icons/fa/spinner";
import { GoogleMapLoader,GoogleMap, Marker, DirectionsRenderer } from "react-google-maps";
import ScriptjsLoader from "react-google-maps/lib/async/ScriptjsLoader";
import Table from '../../Table/Table';
import AppInfoStore from '../../../Store/AppInfoStore';
import AppInfoAction from '../../../Action/AppInfoAction';
import TripInfoStore from '../../../Store/TripInfoStore';
import TripInfoAction from '../../../Action/TripInfoAction';
import connectToStores from 'alt-utils/lib/connectToStores';

@connectToStores
export default class IndexPage extends React.Component {
    static getStores() {
        // this will handle the listening/unlistening for you
        return [AppInfoStore,TripInfoStore];
    }

    static getPropsFromStores() {
        // this is the data that gets passed down as props
        // each key in the object returned by this function is added to the `this.props`
        let headers = AppInfoStore.getState().header;
        let trip_info = TripInfoStore.getState().trips;
        return {
            headers: headers,
            trip_info: trip_info
        }
    }

    static propTypes = {
        //React.PropTypes.string.isRequired,
        //React.PropTypes.bool,
        //React.PropTypes.object,
        //React.PropTypes.oneOf(['value1', 'value2'])
        //reference to official URL: https://facebook.github.io/react/docs/reusable-components.html
        markers:React.PropTypes.arrayOf(React.PropTypes.object)
    }

    static defaultProps = {
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

    constructor() {
        super();
        this.state = {
            data:[],
            directions: null
        }
    }


    componentWillMount(){

    }

    componentDidMount(){
        console.log('Created "index page"');
        //for remote: http://ec2-52-58-27-100.eu-central-1.compute.amazonaws.com/primary/7a3b8bdd-7350-42fa-89fc-50eb61974d0b/_/fleetcontrol-1
        AppInfoAction.loadData('http://ec2-52-58-27-100.eu-central-1.compute.amazonaws.com/primary/7a3b8bdd-7350-42fa-89fc-50eb61974d0b/_/fleetcontrol-1/Asset/data/FleetControlTableHeader.json').then((response) => {
            console.log('load Fleet Control Table Header Successfully');
        }).catch((error) => {
            console.log(error);
        });

        console.log(this.props.headers);

        //for remote: http://ec2-52-58-27-100.eu-central-1.compute.amazonaws.com/primary/7a3b8bdd-7350-42fa-89fc-50eb61974d0b/_/fleetcontrol-1
        TripInfoAction.loadData('http://ec2-52-58-27-100.eu-central-1.compute.amazonaws.com/primary/7a3b8bdd-7350-42fa-89fc-50eb61974d0b/_/fleetcontrol-1/Asset/data/tripinfo.json').then((response) => {
            console.log('load Trip Info Successfully');
            this.setState({
                data: this.props.trip_info
            });
        }).catch((error) => {
            console.log(error);
        });
    }

    expandJSONObject(jsonObject){
        let keys = [];
        for(let key in jsonObject){
            keys.push(
                key
            );
        }
        return keys;
    }

    renderData(){
        let trips = this.props.trip_info;
        let id = "";
        let vin = "";
        let registration = "";
        let model = "";
        let type = "Car Type";
        let brand = "";
        let status = "";
        let latest_event = "Parked";
        let driver = "";
        let trips_brife = [];
        for(let index in trips) {
            if (trips[index] && trips[index].vehicle) {
                id = trips[index].id;
                registration = trips[index].vehicle.registration;
                model = trips[index].vehicle.model;
                type = trips[index].vehicle.type;
                brand = trips[index].vehicle.brand;
                if (trips[index].vehicle.driver) {
                    let driver_id = this.expandJSONObject(trips[index].vehicle.driver)[0];
                    driver = trips[index].vehicle.driver[driver_id].firstName + " " + trips[index].vehicle.driver[driver_id].lastName;
                }
                status = trips[index].status;
            }

            let trip_brife_info = {
                "id":id,
                "registration": registration,
                "model": model,
                "type": type,
                "brand": brand,
                "status": status,
                "latest_event": latest_event,
                "driver": driver,
                "operation":true
            }
            trips_brife.push(
                trip_brife_info
            );
        }
        return trips_brife;
    }

    changeLink(){
        console.log("change link flag")
        AppInfoStore.setChangeLinkFlag();
    }

    changeMap(tripId){
        console.log(tripId);
        let trip = TripInfoStore.findTripById(tripId);

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

        let origin =  new google.maps.LatLng(parseFloat(startPoint_latitude), parseFloat(startPoint_longitude));
        let destination =  new google.maps.LatLng(parseFloat(destination_latitude), parseFloat(destination_longitude));
        const DirectionsService = new google.maps.DirectionsService();
        DirectionsService.route({
            origin: origin,
            destination: destination,
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

    render() {
        let trip_brife_info = this.renderData();
        const directions = this.state.directions;
        return(
            <Page>
                <GoogleMapLoader
                    loadingElement={
                        <div style={{
                              height: `100%`,
                            }}>
                          <FaSpinner  style={{
                                                display: `block`,
                                                width: 100,
                                                height: 100,
                                                margin: `60px auto`,
                                                animation: `fa-spin 2s infinite linear`,
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
                <Table clickFunction={this.changeMap.bind(this)} changeLinkFunction={this.changeLink.bind(this)} header={this.props.headers} data={trip_brife_info}/>
            </Page>
        );
    }
}