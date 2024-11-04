import { ConfirmChannel } from 'amqplib';
import { createDurableConnection } from './durable-connection';

const main = async () => {
  let channel: ConfirmChannel;

  const connection = await createDurableConnection('amqp://localhost:5672', {
    onReconnectAttempt: () => {
      console.log('Attempting reconnect...')
    },
    onReconnectSuccessful: async (connection) => {
      channel = await connection.createConfirmChannel();
      console.log('connection reconnected!');
    },
    onReconnectFailure: () => {
      console.warn('Reconnect failure');
    },
    onError: (error) => {
      console.error('connection error');
    },
    onClose: () => {
      console.log('connection closed');
    }
  });

  channel = await connection.get().createConfirmChannel();

  channel.on('error', error => {
    console.error('channel error!');
    console.error(error);
  });

  channel.publish('shit', '', Buffer.from(''));

  await connection.close();
}

main()
.then(() => console.log('done'));