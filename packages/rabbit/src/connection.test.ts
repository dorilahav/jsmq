import { connect } from 'amqplib';
import { createRabbitConnection, mapConnectionOptionsToUrl, RabbitMQConnection } from './connection';

jest.mock('amqplib');

describe('mapConnectionOptionsToUrl', () => {
  it('maps url option to string', () => {
    const url = mapConnectionOptionsToUrl({url: 'amqp://user:pass@host:10000/vhost'});

    expect(url).toBe('amqp://user:pass@host:10000/vhost')
  });

  it('maps url object to object', () => {
    const url = mapConnectionOptionsToUrl({protocol: 'amqp', username: 'user', password: 'pass', hostname: 'host', port: 10000, vhost: '/vhost'});

    expect(url).toEqual({protocol: 'amqp', username: 'user', password: 'pass', hostname: 'host', port: 10000, vhost: '/vhost'});
  })
});

describe('createRabbitConnection', () => {


  describe('connect', () => {
    it('calls rabbitmq connect once', async () => {
      const connection = createRabbitConnection({url: 'amqp://user:pass@host:10000/vhost'})
      await connection.connect();

      expect(connect as jest.Mock).toHaveBeenCalledTimes(1);
    });
  })

  describe('connection', () => {
    let connection: RabbitMQConnection;

    beforeEach(() => {
      connection = createRabbitConnection({url: 'amqp://user:pass@host:10000/vhost'});
    });

    it('throws an error if didnt call connect before', () => {
      expect(() => connection.connection).toThrow(Error);
    });

    it('returns connection value if did call connect before', async () => {
      await connection.connect();

      expect(connection.connection).toBeDefined();
    })
  })
})