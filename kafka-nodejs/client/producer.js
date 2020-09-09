const {Kafka} = require('kafkajs');
const express = require('express');
const config = require('../utils/config');

const router = express.Router();

const kafka = new Kafka({
  clientId: 'kafka-node-app',
  brokers: [config.kafka_host+':'+config.kafka_broker1_port]
})

const producer = kafka.producer();

const sendMessage =(data)=>{
  console.log("data " , data)
  return producer
    .send({
      topic: data.topicName,
      messages: [
        { key: data.message.type, value: JSON.stringify(data.message)}
      ]
    })
    .then(console.log)
    .catch(e => console.error(`error ${e.message}`, e))
}

router.post('/', (req,res) => {
  const run = async () =>{
    await producer.connect();
    result = sendMessage(req.body);
    res.status(200).send('Message sent: '+  result);
  }
  run().catch(e=> console.error(`error ${e.message}`, e))
});

module.exports = router;