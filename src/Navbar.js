import React from 'react';
import ResponsiveNavbar from 'opuscapita/react-responsive-navbar';
import { Provider } from 'react-redux'
import ServicebotManage from "./forms/management-form.js";
import { createStore, combineReducers} from 'redux'
import {reducer as formReducer} from 'redux-form'
import UserFormEdit from "./forms/user-management.js";

const list = [
    { name: 'Billing' },
    { name: 'Profile' },
  ];

const activeKey = 1;

class ResponsiveNavbarView extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            instances: [],
        };
        this.getUser = this.getUser.bind(this);

    }

    componentDidMount() {
        let self = this;
        self.getUser();
    }

    async getUser(){
        let self = this;
        let url = this.props.serviceInstanceId ? `${self.props.url}/api/v1/service-instances/${this.props.serviceInstanceId}` : `${self.props.url}/api/v1/service-instances/own`
        let instances = await Fetcher(url, "GET", null, this.getRequest("GET"));
        if(this.props.serviceInstanceId){
            instances = [instances];
        }
        for(let instance of instances){
            var uid = instance.user_id;
        }
        Fetcher(`${self.props.url}/api/v1/users/${uid}`).then(function (response) {
            if (!response.error) {
                self.setState({user: response});
                //console.log('fetched all users', self.state.rows);
                //return console.log(response);
            }
        });
    }

  getUserEditForm(){
    let user = this.state.user;
    //let {myUser} = this.state;

    if(user && user.status !== "invited") {
        return <UserFormEdit myUser={user}/>
    }
    return <div className="invited-user-profile basic-info col-md-6 col-md-offset-3">
            <span>Please complete your registration by following the link that was emailed to you prior to editing your profile.</span>
        </div>
}

selectedText(list) {
    if(list.name === 'Billing'){
        this.getBillingManager();
    } else {
        this.getUserEditForm();
    }
}

getBillingManager(){
    const options = (state = {currency : {value : "ngn"}}, action) => {
        switch (action.type) {
            case 'SET_CURRENCY':
                return action.filter
            default:
                return state
        }
    }
    const loadingReducer = (state = false, action) => {
        switch(action.type){
            case "SET_LOADING" :
                return action.is_loading;
            default:
                return state;
        }
    };
    let store = createStore(combineReducers({
        options,
        disableLoader: this.props.disableLoader || false,
        loading : loadingReducer,
        form : formReducer,
    }));

    <div className="App">
        <Provider store={store}>
          <ServicebotManage {...this.props}/>
        </Provider>
      </div>
}

  return () {

    return (
        <ResponsiveNavbar
            activeKey={activeKey}
            list={list}
            onSelect={this.selectedText(list)}
        />
    )
  };
};

export default ResponsiveNavbarView;