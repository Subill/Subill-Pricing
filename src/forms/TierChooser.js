import React from 'react';
import OpenCheckout from "./Checkout.js";
//import Checkout from 'subillcheckout';
import Checkout from "../../node_modules/multi-checkout/dist/index.js";
//import "../../node_modules"
let _ = require('lodash');

const numberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
const intervalNames = {
    "one_time" : "One Time",
    "monthly" : "Monthly",
    "yearly" : "Annually",
    "biannually" : "BiAnnually",
    "daily" : "Daily",
    "weekly" : "Weekly"
};


const findMonthlyPrice = (x, interval) => {
    switch(interval){
        case "monthly":
            return x;
        case "daily":
            return x * 30
        case "weekly":
            return x * 4
        case "every 6 months":
            return Math.floor(x/6);
        case "yearly":
            return Math.floor(x/12);
    }
}

const Tier = (props) => {
    let {tier, plan, pickTier, isCurrent, isSelected} = props;
    let properties = tier.references && tier.references.tier_properties;
    let tierContent, tierButton, tierproperties;
    let formatter = new Intl.NumberFormat("en-US", { style: 'currency', currency: plan.currency || "NGN" }).format;

    //let tierPrice = formatter(findMonthlyPrice(plan.amount, plan.interval)/100);
    let tierPrice = formatter(findMonthlyPrice(plan.amount, plan.interval));
    let ulStyle = {};
    //ulStyle.font = '92px';
    //ulStyle.position= 'relative';
    //ulStyle.height= '56px';
    //ulStyle.width= '100%';
    //ulStyle.display= 'block';
    ulStyle.listStyle = 'none';
    //ulStyle.fontSize= '18px';
    //ulStyle.fontWeight= '600';

    let liStyle = {}
    //liStyle.color= 'rgba(0,0,0,0.7)';
    liStyle.fontSize= '12px';
    liStyle.lineHeight= '16px';
    liStyle.maxWidth= '100%';
    liStyle.padding= '1em';
    liStyle.margin= 'auto';
    liStyle.position= 'relative';

    if(properties) {
        for (let prop of properties) {
            //alert(`Properties: ${prop.prop_label}`)
            tierproperties = prop.prop_label;
        }
    }
    
    if(plan.trial_period_days > 0){
        tierButton = "Try for Free"
    }else{
        tierButton = "Get Started"
    }
    if(plan.type === "subscription"){
        if(tier.unit){
            tierContent = <span>
                {tierPrice}
                <span className="_interval-name">/Month</span>
                <span className="_metered-unit">per {tier.unit}</span>
                {plan.interval !== "monthly" && <span className={`_billing-period`}>Billed {intervalNames[plan.interval]}</span>}
            </span>;
        }else{

            tierContent = <span>{tierPrice}<span className="_interval-name">/Month</span>{plan.interval !== "month" && <span className={`_billing-period`}>Billed {intervalNames[plan.interval]}</span>}<span></span></span>;
        }
        if(plan.amount == 0){
            tierContent = "Free";
        }
    }
    if(plan.type === "one_time"){
        if(plan.amount == 0){
            tierContent = "Free";
        }else{
            tierContent = `${tierPrice}`;
        }
    }
    if(plan.type === "custom"){
        tierContent = "Contact";
        tierButton = "Contact Sales";
    }
    //tierButton = "Change Plan"
    return(
        <div className={`_tier`}>
            <h2 className="_name">{tier.name}</h2>
            <span className="_price">{tierContent}</span>
            <ul style={ulStyle}>
                {properties.map(prop =>  {
                    //alert(`properties: ${prop.prop_label}`);
                    return (<li style={liStyle}>{prop.prop_label}</li>)
                })}
            </ul>
            <button onClick={(e)=> {pickTier(e,plan.id)}} className="_select-tier buttons rounded">{tierButton}</button>
            {/*<ul className="_feature-list">*/}
                {/*{tier.features.map(feature => {*/}
                    {/*return (<li className="_item">{feature}</li>);*/}
                {/*})}*/}
            {/*</ul>*/}
        </div>
    );
}



const IntervalPicker = (props)=> {

    return (
        <ul className="_selector">
            {props.intervals.sort((a, b) => {
                if(a === "yearly" || b === "one_time"){
                    return 1;
                }
                if(a === "one_time" || b === "yearly"){
                    return -1;
                }
                if(a === "monthly"){
                    return 1;
                }
                if(b === "monthly"){
                    return -1
                }
                if(a === "weekly"){
                    return 1
                }
                if(a === "daily"){
                    return -1
                }

            }).map(interval => {
                let intervalClass = "_interval";
                if(props.currentInterval === interval){
                    intervalClass+=" _selected";
                }

                return (<li key={`interval-${intervalNames[interval]}`} className={intervalClass}>{intervalNames[interval]}</li>)
            })
            }
        </ul>
    );
};
class TierSelector extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            tiers: [],
            paymentPlans: {},
            currentInterval: null,
            selectedPlan: props.currentPlan,
            isEmptyState: true,
            isAddCheckoutState: false,
            templateId: 0,
            paymentStructureTemplateId: 0,
            url: ''
        }
        this.pickTier = this.pickTier.bind(this);

    }

    pickTier(e, paymentPlan){
        e.preventDefault();
        let self = this;
        let {template,url} = self.props;
        this.setState({
            isEmptyState: false,
            isAddCheckoutState: true,
            templateId: template.id,
            paymentStructureTemplateId: paymentPlan,
            url: url
          })
    }

    
    async componentDidMount() {
        let {template} = this.props;
        let metricProp = template.references.service_template_properties.find(prop => prop.type === "metric");
        let tiers = template.references.tiers;
        if(metricProp) {
            tiers = template.references.tiers.map((tier, index )=> {
                if (metricProp.config.pricing.tiers && metricProp.config.pricing.tiers.includes(tier.name)) {
                    tier.unit = metricProp.config.unit;
                }
                return tier
            });
        }
        let currentInterval = null;
        let paymentPlans = tiers.reduce(( acc, tier) => {
            return acc.concat(tier.references.payment_structure_templates);
        }, []).reduce((acc, plan)=> {
            if(plan.id){
                currentInterval = plan.interval;
            }
            acc[plan.type] = [plan].concat(acc[plan.type] || []);
            return acc;
        }, {});
        this.setState({tiers, paymentPlans, currentInterval})
    }

    render(){
        let {tiers, currentInterval, currentPlan, selectedPlan, paymentPlans : {subscription, custom, one_time}} = this.state;
        let currentPlans = custom || [];
        let intervals = new Set([]);
        let self = this;
        let checkoutConfig = {};
        if(one_time){
            intervals.add("one_time");
        }
        if(subscription){
            subscription.forEach(sub => {
                intervals.add(sub.interval);
            })
        }
        let intervalArray = Array.from(intervals);
        if(subscription && currentInterval !== "one_time"){
            subscription = subscription.sort((a, b) => {
                return b.amount - a.amount;
            }).reduce((acc, sub) => {
                acc[sub.interval] = [sub].concat(acc[sub.interval] || []);
                return acc;
            }, {});
            currentPlans = subscription[currentInterval || intervalArray[0]].concat(currentPlans);
        }
        if(currentInterval === "one_time"){
            one_time.sort((a, b)=> {
                return b.amount-a.amount;
            });
        }

        if(this.state.isAddCheckoutState) {
            return <div>
            <Checkout useAsComponent={true} templateId={self.state.templateId} paymentStructureTemplateId={self.state.paymentStructureTemplateId}
                                                                    url={self.props.url} forceCard={self.props.forceCard} setPassword={self.props.setPassword}/>
            </div>
        }

        return (
            <div className={`subill-subscription`}>
                <div className="subill-billing-type-selector">
                    {currentInterval && currentInterval!== "custom" && <IntervalPicker currentInterval={currentInterval} intervals={intervalArray}/>}
                </div>
                <h3 style={{textAlign: "center", paddingBottom: "33px"}}>Select a Subscription level</h3>
                {currentInterval !== "custom" && <div className="subill-pricing-table">
                    {_.sortBy(currentPlans, ['amount', 'id']).map(plan => {
                        if(plan.type === "custom"){
                            return <div></div>
                        }
                        let props = {
                            pickTier: self.pickTier,
                            key: plan.id,
                            tier: tiers.find(tier => tier.id === plan.tier_id),
                            plan: plan,
                            currentPlan
                        }
                        

                        if (plan.id) {
                            props.isCurrent = true;
                        }
                        if (plan.id === selectedPlan) {
                            props.isSelected = true;
                        }
                        return <div>
                            {this.state.isEmptyState && <Tier key={`plan-${plan.id}`} {...props}/>}
                            {/*this.state.isAddCheckoutState && <Checkout useAsComponent={true} templateId={self.state.templateId} paymentStructureTemplateId={self.state.paymentStructureTemplateId}
                                                                    url={self.state.url} forceCard={false} setPassword={true}/>*/}
                            </div>
                    })}
                </div>
                }
                {currentInterval === "custom" && <p>Enterprise Plan</p>}

            </div>
        );
    }
}
export default TierSelector