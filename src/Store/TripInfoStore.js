/**
 * Created by ebinhon on 3/22/2016.
 */
import alt from '../alt';
import BaseStore from './BaseStore';
import TripInfoAction from '../Action/TripInfoAction';


class TripInfoStore extends BaseStore {
    constructor() {
        super();
        this.state = {};
        // Binds the TripInfoStore methods to their 'on' equivalents
        this.bindActions(TripInfoAction);
    }

    static findTripById(id){
        let trips = this.state.trips;
        for(let index in trips){
            if(trips[index].id == id){
                return trips[index];
            }
        }
        return null;
    }

}

export default alt.createStore(TripInfoStore, 'TripInfoStore');