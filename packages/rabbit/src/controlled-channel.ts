import { ConfirmChannel, Connection } from 'amqplib';

export const createControlledChannel = async (connection: Connection, onError: (error: Error) => void, onConnect: (channel: ConfirmChannel) => void) => {
  let channel: ConfirmChannel;

  const initChannel = async () => {
    channel = await connection.createConfirmChannel();
    channel.on('error', onError);
    channel.on('close', () => {
      console.info('Channel closed! Reconnecting in 5 seconds...');

      setTimeout(() => initChannel(), 5000);
    });

    onConnect(channel);
  }

  await initChannel();

  return {
    get: () => channel
  }
}