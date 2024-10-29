import { ConfirmChannel } from 'amqplib';
import { ConsumerDeclaration, ExchangeBindingDeclaration, ExchangeDeclaration, QueueBindingDeclaration, QueueDeclaration, RabbitMQDeclarations } from './declarations';

export const applyDeclarations = async (channel: ConfirmChannel, declarations: RabbitMQDeclarations) => {
  const {
    exchanges,
    queues,
    exchangeBindings,
    queueBindings,
    consumers
  } = declarations;

  await Promise.all(exchanges.map(d => applyExchangeDeclaration(channel, d)));
  await Promise.all(queues.map(d => applyQueueDeclaration(channel, d)));
  await Promise.all(exchangeBindings.map(d => applyExchangeBindingDeclaration(channel, d)));
  await Promise.all(queueBindings.map(d => applyQueueBindingDeclaration(channel, d)));
  await Promise.all(consumers.map(d => applyConsumerDeclaration(channel, d)));
}

const applyExchangeDeclaration = (channel: ConfirmChannel, declaration: ExchangeDeclaration) => {
  return channel.assertExchange(declaration.name, 'fanout', {durable: true})
}

const applyQueueDeclaration = (channel: ConfirmChannel, declaration: QueueDeclaration) => {
  return channel.assertQueue(declaration.name, {durable: true});
}

const applyExchangeBindingDeclaration = (channel: ConfirmChannel, declaration: ExchangeBindingDeclaration) => {
  return channel.bindExchange(declaration.targetExchange, declaration.sourceExchange, '');
}

const applyQueueBindingDeclaration = (channel: ConfirmChannel, declaration: QueueBindingDeclaration) => {
  return channel.bindQueue(declaration.targetQueue, declaration.sourceExchange, '');
}

const applyConsumerDeclaration = (channel: ConfirmChannel, declaration: ConsumerDeclaration) => {
  return channel.consume(declaration.queueName, declaration.consumer);
}