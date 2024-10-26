export interface ExchangeDeclaration {
  name: string;
}

export interface QueueDeclaration {
  name: string;
}

export interface QueueBindingDeclaration {
  sourceExchange: string;
  targetQueue: string;
}

export interface ExchangeBindingDeclaration {
  sourceExchange: string;
  targetExchange: string;
}

export interface ConsumerDeclaration {
  queueName: string;
  consumer: () => void;
}

export interface RabbitMQDeclarations {
  exchanges: Array<ExchangeDeclaration>;
  queues: Array<QueueDeclaration>;
  queueBindings: Array<QueueBindingDeclaration>;
  exchangeBindings: Array<ExchangeBindingDeclaration>;
  consumers: Array<ConsumerDeclaration>;
}

interface DeclarationBuilderFunctions {
  declareExchange: (options: ExchangeDeclaration) => DeclarationBuilderFunctions;
  declareQueue: (options: QueueDeclaration) => DeclarationBuilderFunctions;
  bindExchangeToExchange: (options: ExchangeBindingDeclaration) => DeclarationBuilderFunctions;
  bindQueueToExchange: (options: QueueBindingDeclaration) => DeclarationBuilderFunctions;
  consume: (options: ConsumerDeclaration) => DeclarationBuilderFunctions;
}

export type DeclareFunction = (declaration: DeclarationBuilderFunctions) => void;

export class RabbitMQDeclarationBuilder implements DeclarationBuilderFunctions {
  private declarations: RabbitMQDeclarations;

  constructor() {
    this.declarations = {
      exchanges: [],
      queues: [],
      queueBindings: [],
      exchangeBindings: [],
      consumers: []
    };
  }

  declareExchange = (options: ExchangeDeclaration) => {
    this.declarations.exchanges.push(options);
    return this;
  };

  declareQueue = (options: QueueDeclaration) => {
    this.declarations.queues.push(options);
    return this;
  };

  bindExchangeToExchange = (options: ExchangeBindingDeclaration) => {
    this.declarations.exchangeBindings.push(options);
    return this;
  };

  bindQueueToExchange = (options: QueueBindingDeclaration) => {
    this.declarations.queueBindings.push(options);
    return this;
  };

  consume = (options: ConsumerDeclaration) => {
    this.declarations.consumers.push(options);
    return this;
  };

  public build() {
    return this.declarations;
  }
}

export const createDeclaration = (builder: DeclareFunction) => builder;