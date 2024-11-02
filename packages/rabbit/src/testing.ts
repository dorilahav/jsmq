import { connect } from 'amqplib';
import { createControlledChannel } from './controlled-channel';

const main = async () => {
  const connection = await connect('amqp://localhost:5672');
  const channel = await createControlledChannel(
    connection,
    (error) => {
      console.error(error);
    },
    () => {
      console.log('channel opened!');
    }
  );

  channel.get().publish('shit', '', Buffer.from(''));
}

main()
.then(() => console.log('done'));