const sendgrid = require('@sendgrid/mail');
const api_Key = "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";

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