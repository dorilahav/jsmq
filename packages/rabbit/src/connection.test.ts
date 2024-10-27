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

    it('throws an exception if already connected', async () => {
      const connection = createRabbitConnection({url: 'amqp://user:pass@host:10000/vhost'});
      await connection.connect();

      await expect(connection.connect).rejects.toThrow();
    })
  })

  describe('connection', () => {
    let connection: RabbitMQConnection;

    beforeEach(() => {
      connection = createRabbitConnection({url: 'amqp://user:pass@host:10000/vhost'});
    });

    it('returns null before calling connect', () => {
      expect(connection.connection).toBeNull();
    });

    it('returns a connection after calling connect', async () => {
      await connection.connect();

      expect(connection.connection).not.toBeNull();
    })
  });

  describe('channel', () => {
    let connection: RabbitMQConnection;

    beforeEach(() => {
      connection = createRabbitConnection({url: 'amqp://user:pass@host:10000/vhost'});
    });

    it('returns null before calling connect', () => {
      expect(connection.channel).toBeNull();
    });

    it('returns a channel after calling connect', async () => {
      await connection.connect();

      expect(connection.channel).not.toBeNull();
    })
  });

});