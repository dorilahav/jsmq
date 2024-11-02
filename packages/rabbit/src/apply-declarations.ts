import { ConfirmChannel, Options } from 'amqplib';
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
  const options: Options.AssertExchange = {};

  if ('durable' in declaration) {
    options.durable = declaration.durable;
  }

  if ('internal' in declaration) {
    options.internal = declaration.internal;
  }

  if ('autoDelete' in declaration) {
    options.autoDelete = declaration.autoDelete;
  }

  if ('alternateExchange' in declaration) {
    options.alternateExchange = declaration.alternateExchange;
  }

  if ('arguments' in declaration) {
    options.arguments = declaration.arguments;
  }

  return channel.assertExchange(declaration.name, declaration.type ?? 'fanout', options);
}

const applyQueueDeclaration = (channel: ConfirmChannel, declaration: QueueDeclaration) => {
  const options: Options.AssertQueue = {};

  if ('exclusive' in declaration) {
    options.exclusive = declaration.exclusive;
  }
  
  if ('durable' in declaration) {
    options.durable = declaration.durable;
  }
  
  if ('autoDelete' in declaration) {
    options.autoDelete = declaration.autoDelete;
  }
  
  if ('expires' in declaration) {
    options.expires = declaration.expires;
  }
  
  if ('maxPriority' in declaration) {
    options.maxPriority = declaration.maxPriority;
  }
  
  if ('maxLength' in declaration) {
    options.maxLength = declaration.maxLength;
  }
  
  if ('messageTtl' in declaration) {
    options.messageTtl = declaration.messageTtl;
  }
  
  if ('deadLettering' in declaration) {
    options.deadLetterExchange = declaration.deadLettering?.exchange;

    if (declaration.deadLettering && 'routingKey' in declaration.deadLettering) {
      options.deadLetterRoutingKey = declaration.deadLettering?.routingKey;
    }
  }
  
  if ('arguments' in declaration) {
    options.arguments = declaration.arguments;
  }
  
  return channel.assertQueue(declaration.name, options);
}

const applyExchangeBindingDeclaration = (channel: ConfirmChannel, declaration: ExchangeBindingDeclaration) => {
  const pattern = declaration.pattern ?? '#';
  const args = declaration.arguments;

  return channel.bindExchange(declaration.targetExchange, declaration.sourceExchange, pattern, args);
}

const applyQueueBindingDeclaration = (channel: ConfirmChannel, declaration: QueueBindingDeclaration) => {
  const pattern = declaration.pattern ?? '#';
  const args = declaration.arguments;

  return channel.bindQueue(declaration.targetQueue, declaration.sourceExchange, pattern, args);
}

const applyConsumerDeclaration = (channel: ConfirmChannel, declaration: ConsumerDeclaration) => {
  const options: Options.Consume = {};

  if ('noAck' in declaration) {
    options.noAck = declaration.noAck;
  }

  if ('priority' in declaration) {
    options.priority = declaration.priority;
  }

  if ('exclusive' in declaration) {
    options.exclusive = declaration.exclusive;
  }

  if ('arguments' in declaration) {
    options.arguments = declaration.arguments;
  }

  return channel.consume(declaration.queueName, declaration.consumer, options);
}