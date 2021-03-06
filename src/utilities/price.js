import React from 'react';


/**
 * This is used to display Stripe amount values,
 * Since Stripe takes amount in cents, we want to convert it and display dollar value.
 */
function getPriceValue(value){
   // return `$${(value/100).toFixed(2)}`;
    return `$${(value).toFixed(2)}`;
}

function formatMoney(price, c, d, t){
    let n = price;
    let cNew = isNaN(c = Math.abs(c)) ? 2 : c;
    let dNew = d == undefined ? "." : d;
    let tNew = t == undefined ? "," : t;
    let s = n < 0 ? "-" : "";
    let i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(cNew)));
    let j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + tNew : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + tNew) + (cNew ? dNew + Math.abs(n - i).toFixed(cNew).slice(2) : "");
};

let Price = function(props){
    //let price = props.value/100;
    let price = props.value;
    let formatter = new Intl.NumberFormat("en-US", { style: 'currency', currency: (props.currency && props.currency.toUpperCase()) || "NGN" }).format;
    return(
        <span className="_price-value">{ formatter(price)}</span>
    );
};

let getPrice = (myService, serviceType = null)=>{
    let serType = myService.type || serviceType;
let currency = (myService.payment_plan && myService.payment_plan.body.data.currency) || "USD"
    if (serType === "subscription"){
        return (
            <span className="_unit">
                <Price value={myService.payment_plan.body.data.amount} currency={currency}/>
                <span>{myService.payment_plan.interval_count === 1 ? ' /' : ' / ' + myService.payment_plan.body.data.interval}</span>
            </span>
        );
    }else if (serType === "one_time"){
        return (<span><Price value={myService.amount} currency={currency}/></span>);
    }else if (serType === "custom"){
        return false;
    } else{
        return (<span><Price value={myService.amount} currency={currency}/></span>)
    }
};
/**
 * To be deprecated after refactoring all code
 * @param myService - a service template record row
 * @returns {*}
 */
let getBillingType = (myService)=>{
    let serType = myService.type;

    if (serType === "subscription"){
        return ("Subscription");
    } else if (serType === "one_time"){
        return ("One-time");
    } else if (serType === "custom") {
        return ("Ongoing");
    } else if (serType === "split"){
        return ("Scheduled");
    } else{
        return ("Other")
    }
};

/**
 * Takes a service template and returns the text from row.type after formatting
 * @param row - a service template record row
 * @returns {string}
 */
let serviceTypeFormatter = (row)=>{
    let type = row.type;

    let text = type.replace(/_/g, " ");
    return ( text.charAt(0).toUpperCase() + text.slice(1) );
};


export {Price, getPrice, getBillingType, serviceTypeFormatter, getPriceValue};
