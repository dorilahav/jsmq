import { MQBrokerClient } from '@jsmq/core';
import { applyDeclarations } from './apply-declarations';
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
    const declarations = this.declarations.build();

    if (!this.connection.channel) {
      return;
    }
    await applyDeclarations(this.connection.channel, declarations);
  }
}