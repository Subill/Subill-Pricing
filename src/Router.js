import React from 'react';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
// Dashboard (My Services)
import ServicebotManagedBilling from "./forms/management-form.js"
import UserFormEdit from "./forms/user-management.js";

class AppRouter extends React.Component {
    render(){
        return (
            <BrowserRouter>
                    <Switch>
                        <Route name="My Account" path="my-services" component={ServicebotManage}/>
                        <Route name="Edit User" path="profile" component={UserFormEdit}/>
                    </Switch>
            </BrowserRouter>
        )
    }
}

export default AppRouter;

