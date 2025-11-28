const amqp = require('amqplib');

async function producer(data) {
    const connection = await amqp.connect('amqp://127.0.0.1');
    const channel = connection.createChannel();
    
    
}