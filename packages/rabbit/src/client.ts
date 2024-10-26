import { MQBrokerClient } from '@jsmq/core';
import { DeclareFunction, RabbitMQDeclarationBuilder } from './declarations';

export class RabbitMQClient extends MQBrokerClient {
  private declarations: RabbitMQDeclarationBuilder;

  constructor() {
    super();

    this.declarations = new RabbitMQDeclarationBuilder();
  }

  declare = (fn: DeclareFunction) => {
    fn(this.declarations);
  }
}