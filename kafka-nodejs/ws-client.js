// for debugging ws client
const WebSocket = require('ws');
const url = 'ws://localhost:3001/consumer';
const connection = new WebSocket(url);


connection.onopen = () => {
  connection.send('ner-incremental-local');
}

connection.onerror = (error) => {
  console.log(`Web Socket error: ${error}`);
}

connection.onmessage = (e) => {
  console.log(e.data);
}