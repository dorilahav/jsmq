import { ConfirmChannel } from 'amqplib';
import { applyDeclarations } from './apply-declarations';
import { RabbitMQDeclarations } from './declarations';

describe('applyDeclarations', () => {
  let channel: ConfirmChannel;
  let declarations: RabbitMQDeclarations;

  beforeEach(() => {
    channel = {
      assertExchange: jest.fn(),
      assertQueue: jest.fn(),
      bindExchange: jest.fn(),
      bindQueue: jest.fn(),
      consume: jest.fn()
    } as any;

    declarations = {
      exchanges: [],
      queues: [],
      exchangeBindings: [],
      queueBindings: [],
      consumers: []
    };
  });

  describe('exchange declararions', () => {
    it('only applies exchange declaration', async () => {
      declarations.exchanges.push({name: 'test-exchange'});

      await applyDeclarations(channel, declarations);

      expect(channel.assertExchange).toHaveBeenCalledTimes(1);
      expect(channel.assertQueue).not.toHaveBeenCalled();
      expect(channel.bindExchange).not.toHaveBeenCalled();
      expect(channel.bindQueue).not.toHaveBeenCalled();
      expect(channel.consume).not.toHaveBeenCalled();
      expect(channel.assertExchange).toHaveBeenCalledWith('test-exchange', 'fanout', {});
    });

    it('applies falsey options', async () => {
      declarations.exchanges.push({
        name: '', type: 'direct', durable: false, internal: false,
        autoDelete: false, alternateExchange: '', arguments: {}
      });

      await applyDeclarations(channel, declarations);

      expect(channel.assertExchange).toHaveBeenCalledTimes(1);
      expect(channel.assertExchange).toHaveBeenCalledWith('', 'direct', {
        durable: false, internal: false, autoDelete: false, alternateExchange: '', arguments: {}
      });
    });
  });

  describe('queue declararions', () => {
    it('only applies queue declaration', async () => {
      declarations.queues.push({name: 'test-queue'});

      await applyDeclarations(channel, declarations);

      expect(channel.assertExchange).not.toHaveBeenCalled();
      expect(channel.assertQueue).toHaveBeenCalledTimes(1);
      expect(channel.bindExchange).not.toHaveBeenCalled();
      expect(channel.bindQueue).not.toHaveBeenCalled();
      expect(channel.consume).not.toHaveBeenCalled();
      expect(channel.assertQueue).toHaveBeenCalledWith('test-queue', {});
    });

    it('applies falsey options', async () => {
      declarations.queues.push({
        name: '', exclusive: false, durable: false, autoDelete: false, expires: 0, maxPriority: 0,
        maxLength: 0, messageTtl: 0, deadLettering: {exchange: '', routingKey: ''}, arguments: {}
      });

      await applyDeclarations(channel, declarations);

      expect(channel.assertQueue).toHaveBeenCalledTimes(1);
      expect(channel.assertQueue).toHaveBeenCalledWith('', {
        exclusive: false, durable: false, autoDelete: false, expires: 0, maxPriority: 0, maxLength: 0,
        messageTtl: 0, deadLetterExchange: '', deadLetterRoutingKey: '', arguments: {}
      });
    });
  });

  describe('exchange binding declararions', () => {
    it('only applies exchange binding declaration', async () => {
      declarations.exchangeBindings.push({sourceExchange: 'source-exchange', targetExchange: 'target-exchange'});

      await applyDeclarations(channel, declarations);

      expect(channel.assertExchange).not.toHaveBeenCalled();
      expect(channel.assertQueue).not.toHaveBeenCalled();
      expect(channel.bindExchange).toHaveBeenCalledTimes(1);
      expect(channel.bindQueue).not.toHaveBeenCalled();
      expect(channel.consume).not.toHaveBeenCalled();
      expect(channel.bindExchange).toHaveBeenCalledWith('target-exchange', 'source-exchange', '#', undefined);
    });

    it('applies falsey options', async () => {
      declarations.exchangeBindings.push({
        sourceExchange: '', targetExchange: '', pattern: '', arguments: {}
      });

      await applyDeclarations(channel, declarations);

      expect(channel.bindExchange).toHaveBeenCalledTimes(1);
      expect(channel.bindExchange).toHaveBeenCalledWith('', '', '', {});
    });
  });

  describe('queue binding declararions', () => {
    it('only applies queue binding declarations', async () => {
      declarations.queueBindings.push({sourceExchange: 'source-exchange', targetQueue: 'target-queue'});

      await applyDeclarations(channel, declarations);

      expect(channel.assertExchange).not.toHaveBeenCalled();
      expect(channel.assertQueue).not.toHaveBeenCalled();
      expect(channel.bindExchange).not.toHaveBeenCalled();
      expect(channel.bindQueue).toHaveBeenCalledTimes(1);
      expect(channel.consume).not.toHaveBeenCalled();
      expect(channel.bindQueue).toHaveBeenCalledWith('target-queue', 'source-exchange', '#', undefined);
    });

    it('applies falsey options', async () => {
      declarations.queueBindings.push({
        sourceExchange: '', targetQueue: '', pattern: '', arguments: {}
      });

      await applyDeclarations(channel, declarations);

      expect(channel.bindQueue).toHaveBeenCalledTimes(1);
      expect(channel.bindQueue).toHaveBeenCalledWith('', '', '', {});
    });
  });

  describe('consumer declaration', () => {
    it('only applies consumer declarations', async () => {
      const consumer = () => {};
      declarations.consumers.push({queueName: 'test-queue', consumer});

      await applyDeclarations(channel, declarations);

      expect(channel.assertExchange).not.toHaveBeenCalled();
      expect(channel.assertQueue).not.toHaveBeenCalled();
      expect(channel.bindExchange).not.toHaveBeenCalled();
      expect(channel.bindQueue).not.toHaveBeenCalled();
      expect(channel.consume).toHaveBeenCalledTimes(1);
      expect(channel.consume).toHaveBeenCalledWith('test-queue', consumer, {});
    });

    it('applies falsey options', async () => {
      const consumer = () => {};

      declarations.consumers.push({
        queueName: '', consumer, noAck: false, exclusive: false, priority: 0, arguments: {}
      });

      await applyDeclarations(channel, declarations);

      expect(channel.consume).toHaveBeenCalledTimes(1);
      expect(channel.consume).toHaveBeenCalledWith('', consumer, {
        noAck: false, exclusive: false, priority: 0, arguments: {}
      });
    });
  });
})