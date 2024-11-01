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

  it('applies exchange declarations', async () => {
    declarations.exchanges.push({name: 'test-exchange'});

    await applyDeclarations(channel, declarations);

    expect(channel.assertExchange).toHaveBeenCalledTimes(1);
    expect(channel.assertQueue).not.toHaveBeenCalled();
    expect(channel.bindExchange).not.toHaveBeenCalled();
    expect(channel.bindQueue).not.toHaveBeenCalled();
    expect(channel.consume).not.toHaveBeenCalled();
    expect(channel.assertExchange).toHaveBeenCalledWith('test-exchange', 'fanout', {durable: true});
  });

  it('applies queue declarations', async () => {
    declarations.queues.push({name: 'test-queue'});

    await applyDeclarations(channel, declarations);

    expect(channel.assertExchange).not.toHaveBeenCalled();
    expect(channel.assertQueue).toHaveBeenCalledTimes(1);
    expect(channel.bindExchange).not.toHaveBeenCalled();
    expect(channel.bindQueue).not.toHaveBeenCalled();
    expect(channel.consume).not.toHaveBeenCalled();
    expect(channel.assertQueue).toHaveBeenCalledWith('test-queue', {durable: true});
  });

  it('applies exchange binding declarations', async () => {
    declarations.exchangeBindings.push({sourceExchange: 'source-exchange', targetExchange: 'target-exchange'});

    await applyDeclarations(channel, declarations);

    expect(channel.assertExchange).not.toHaveBeenCalled();
    expect(channel.assertQueue).not.toHaveBeenCalled();
    expect(channel.bindExchange).toHaveBeenCalledTimes(1);
    expect(channel.bindQueue).not.toHaveBeenCalled();
    expect(channel.consume).not.toHaveBeenCalled();
    expect(channel.bindExchange).toHaveBeenCalledWith('target-exchange', 'source-exchange', '');
  });

  it('applies queue binding declarations', async () => {
    declarations.queueBindings.push({sourceExchange: 'source-exchange', targetQueue: 'target-queue'});

    await applyDeclarations(channel, declarations);

    expect(channel.assertExchange).not.toHaveBeenCalled();
    expect(channel.assertQueue).not.toHaveBeenCalled();
    expect(channel.bindExchange).not.toHaveBeenCalled();
    expect(channel.bindQueue).toHaveBeenCalledTimes(1);
    expect(channel.consume).not.toHaveBeenCalled();
    expect(channel.bindQueue).toHaveBeenCalledWith('target-queue', 'source-exchange', '');
  });

  it('applies consumer declarations', async () => {
    const consumer = () => {};
    declarations.consumers.push({queueName: 'test-queue', consumer});

    await applyDeclarations(channel, declarations);

    expect(channel.assertExchange).not.toHaveBeenCalled();
    expect(channel.assertQueue).not.toHaveBeenCalled();
    expect(channel.bindExchange).not.toHaveBeenCalled();
    expect(channel.bindQueue).not.toHaveBeenCalled();
    expect(channel.consume).toHaveBeenCalledTimes(1);
    expect(channel.consume).toHaveBeenCalledWith('test-queue', consumer);
  });
})