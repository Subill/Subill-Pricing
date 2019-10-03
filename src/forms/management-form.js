import React from 'react';
import {Fetcher} from 'servicebot-base-form';
import {Price, getPrice} from '../utilities/price.js';
import DateFormat from "../utilities/date-format.js";
import {injectStripe} from "react-stripe-elements";
import {connect} from "react-redux";
import TierChoose from "./TierChooser"
import {PriceBreakdown} from "../utilities/widgets";
import Load from "../utilities/load.js";

class ServicebotManagedBilling extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            instances: [],
            selectedTemplate: this.props.templateId,
            funds: [],
            templates: {},
            user: {},
            fund_url : "api/v1/funds",
            spk: null,
            loading:true,
            cancel_modal: false,
            token: null,
            error: null,
            propEdit: false,
            tiers: {},
            currentInstance: {}
        };
        this.handleResponse = this.handleResponse.bind(this);
        this.getRequest = this.getRequest.bind(this);
        this.getTemplateDetails = this.getTemplateDetails.bind(this);
    }

    componentDidMount() {
        let self = this;
        self.getTemplateDetails();
    }

    handleResponse(instance){
        let self = this;
        return async (response)=> {
            self.props.handleResponse && self.props.handleResponse({event: "add_fund",response});
            if(instance.status === "cancelled" && self.state.instances.length === 1){
                await self.resubscribe(instance.id)();
            }else if(self.state.formError || self.state.resubscribeError){
                self.setState({formError: null, resubscribeError: null});
            }
            self.props.setLoading(false);
        }

    }

    async getTemplateDetails(){
        let templates = await Fetcher(`${this.props.url}/api/v1/service-templates/${this.props.templateId}/request`, null, null, this.getRequest());
        this.setState({templates: templates});
    }

    getRequest(method="GET", body){
        let headers = {
            "Content-Type": "application/json"
        };
        if(this.props.token){
            headers["Authorization"] = "JWT " + this.props.token;
        }
        let request = { method: method,
            headers: new Headers(headers),
        };
        if(method === "POST" || method==="PUT"){
            request.body = JSON.stringify(body)
        }
        return request;
    }

    render () {
        let self = this;
        let template = self.state.templates
        let url = this.props;

        // let metricProp = self.state.template && self.state.template.references.service_template_properties.find(prop => prop.type === "metric");

        return (
            <div className="subill--embeddable subill--manage-billing-form-wrapper custom">
                <Load className={`subill-embed-custom-loader`} finishLoading={this.props.finishLoading}/>
                <div className="mbf--form-wrapper">
                        <div className="app-content">
                                {/*todo: style this when it's available or designed */}
                                    <div className="mbf--subscription-summary-wrapper">
                                            <div className="mbf--current-services-list">
                                                    
                                                    <div key={`service-list-${template.id}`} className="mbf--current-services-item">
                                                        
                                                        <TierChoose key={"t-" + template.id} template={template} url={url} {...this.props}/>
                                                        
                                                    </div>
                                                
                                            </div>
                                        </div>
                        </div>
                </div>
            </div>
        );
    }
}

let mapDispatchToProps = function(dispatch){
    return {
        setLoading : function(is_loading){
            dispatch({type: "SET_LOADING", is_loading});
        }}
}

ServicebotManagedBilling = connect(null, mapDispatchToProps)(ServicebotManagedBilling);
export default ServicebotManagedBilling