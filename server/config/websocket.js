const WebSocket = require('ws');
const { consumer, topics } = require('./kafka');

const setupWebSocket = (server) => {
  const wss = new WebSocket.Server({ server });
  const clients = new Map();

  wss.on('connection', (ws, req) => {
    const userId = req.url.split('=')[1]; 
    if (userId) {
      clients.set(userId, ws);
    }

    ws.on('close', () => {
      if (userId) {
        clients.delete(userId);
      }
    });
  });

  // Setup Kafka consumer for task updates
  const setupKafkaConsumer = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: topics.TASK_UPDATES });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const notification = JSON.parse(message.value.toString());
        const { userId } = notification;

        const userWs = clients.get(userId.toString());
        if (userWs && userWs.readyState === WebSocket.OPEN) {
          userWs.send(JSON.stringify(notification));
        }
      },
    });
  };

  setupKafkaConsumer().catch(console.error);

  return wss;
};

module.exports = setupWebSocket;
