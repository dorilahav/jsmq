import { MQBrokerClient } from '@jsmq/core';
import { createRabbitConnection, RabbitMQConnection, RabbitMQConnectionOptions } from './connection';
import { DeclareFunction, RabbitMQDeclarationBuilder } from './declarations';

export class RabbitMQClient extends MQBrokerClient {
  private declarations: RabbitMQDeclarationBuilder;
  private connection: RabbitMQConnection;

  constructor(options: RabbitMQConnectionOptions) {
    super();

    this.declarations = new RabbitMQDeclarationBuilder();
    this.connection = createRabbitConnection(options);
  }

  declare = (fn: DeclareFunction) => {
    fn(this.declarations);
  }

  async connect() {
    await this.connection.connect();
    await this.applyDeclarations();
  }

  async applyDeclarations() {
    const {
      exchanges,
      queues,
      exchangeBindings,
      queueBindings,
      consumers
    } = this.declarations.build();

    if (!this.connection.channel) {
      return;
    }

    const channel = this.connection.channel;

    await Promise.all(exchanges.map(d => channel.assertExchange(d.name, 'fanout', {durable: true})));
    await Promise.all(queues.map(d => channel.assertQueue(d.name, {durable: true})));
    await Promise.all(exchangeBindings.map(d => channel.bindExchange(d.targetExchange, d.sourceExchange, '')));
    await Promise.all(queueBindings.map(d => channel.bindQueue(d.targetQueue, d.sourceExchange, '')));
    await Promise.all(consumers.map(d => channel.consume(d.queueName, d.consumer)));
  }
}