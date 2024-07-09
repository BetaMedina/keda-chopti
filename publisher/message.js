//eslint-disable-next-line
import amqp from "amqplib"
const RABBIT_MOCKED = Object.freeze({
  MESSAGE: {
    "pattern": "send_notification_to_user",
    "data": {
      "businessUnit": "BOT",
      "userId": "id-teste",
      "notification": {
        "message": "teste",
        "title": "teste title"
      }
    }
  },
  QUEUE: "notification"
})
const assertChannel = async (connection) => {
  const channel = await connection.createChannel();
  await channel.assertQueue(RABBIT_MOCKED.QUEUE, { durable: false });
  return channel
}
const sendToQueue = (channel, connection) => async (message) => {
  await channel.sendToQueue(RABBIT_MOCKED.QUEUE, Buffer.from(JSON.stringify(message)));
  await channel.close();
  connection.close();
}
const exec = async (iterations=100) => {
  for (let i = 0; i < iterations; i++) {
    let connection;
    try {
      connection = await amqp.connect("amqp://guest:guest@127.0.0.1:5672");
      const channel = await assertChannel(connection)
      await sendToQueue(channel,connection)(RABBIT_MOCKED.MESSAGE)
    } catch (err) {
      console.warn(err);
    }
  }
}
await exec(600)