import { ChannelPool } from './channel-pool';
import { DurableConnection } from './durable-connection';

const main = async () => {
  const connection = new DurableConnection({ url: 'amqp://localhost:5672' });

  connection.on('reconnect-attempt', () => console.log('Attempting reconnect...'));
  connection.on('reconnect-success', () => console.log('Connection restored!'));
  connection.on('reconnect-failed', () => console.log('Reconnection failed!'));
  connection.on('error', () => console.log('Connection error'));
  connection.on('close', () => console.log('Connection closed'));

  const pool = new ChannelPool(connection, { maxSize: 2 });

  const res1 = await pool.aquire();
  res1.channel.publish('pdf-requested', '', Buffer.from('{}'));
  pool.release(res1);

  const res2 = await pool.aquire();
  res2.channel.publish('pdf-requested', '', Buffer.from('{}'));
  // await res2.channel.close();

  const res3 = await pool.aquire();
  res3.channel.publish('pdf-requested', '', Buffer.from('{}'));
}

main()
.then(() => console.log('done'));