import React from 'react';
let _ = require('lodash');

class OpenCheckout extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            templateId: props.templateId,
            paymentStructureTemplateId: props.paymentStructureTemplateId,
            url: props.url
        }

    }

    componentDidMount() {
        let self = this;
        const script = document.createElement('script');
        script.setAttribute(
          'src', 
          'https://js.subill.co/public/js/checkout.js');
        script.addEventListener('load', () => {
        Subill.Checkout({
            templateId : self.state.templateId,
            paymentStructureTemplateId: self.state.paymentStructureTemplateId,
            url: self.state.url,
            forceCard: false,
            setPassword: true,
            selector : document.getElementById('subill-request-form')
          });
        });
        document.body.appendChild(script);
      }

    render(){
        let self = this;
        return (
            <div id="subill-request-form"></div>
        )
    }
}

export default OpenCheckout