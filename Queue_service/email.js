const sendgrid = require('@sendgrid/mail');
require('dotenv').config();

const api_Key = process.env.SENDGRID_API_KEY;
console.log(api_Key)

sendgrid.setApiKey(api_Key);

async function send_mail(data) {
    try {
        let result = await sendgrid.send(data);
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }    
}

module.exports = {send_mail};