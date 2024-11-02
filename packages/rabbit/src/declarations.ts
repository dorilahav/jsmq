export type ExchangeType = 'direct' | 'fanout' | 'topic' | 'headers' | 'match';

export type ExchangeArguments = any;

// TOOD: Think about uniting autoDelete, durable and exclusive into one durability object.
// TODO: Think about how to tackle not providing a name and using a consumer on the queue. Might be good for auto-delete and exclusive queues.

export interface ExchangeDeclaration {
  /**
   * The exchange name.
   */
  name: string;
  /**
   * The exchange type.
   * 
   * @see https://www.rabbitmq.com/tutorials/amqp-concepts#exchanges
   * @default fanout
   */
  type?: ExchangeType;
  /**
   * If false, the exchange will be deleted when broker restarts.
   * 
   * @see https://www.rabbitmq.com/tutorials/amqp-concepts#exchanges
   * @default true
   */
  durable?: boolean;
  /**
   * If true, messages cannot be directly published to this exchange (only through bindings).
   * 
   * @see https://www.rabbitmq.com/tutorials/amqp-concepts#exchanges
   * @default false
   */
  internal?: boolean;
  /**
   * If true, this exchange will be deleted when the number of bindings is zero.
   * 
   * @default false
   */
  autoDelete?: boolean;
  /**
   * An exchange to send messages to when no bindings are set to this exchange.
   * 
   * @see https://www.rabbitmq.com/docs/ae
   * @default undefined
   */
  alternateExchange?: string;
  /**
   * Any other arguments to send to the broker when creating this exchange.
   * Some additional arguments may be needed with special exchange types such as headers etc.
   */
  arguments?: ExchangeArguments;
}

export type QueueArguments = any;

export interface QueueDeadLetteringOptions {
  /**
   * The exchange to route dead-lettered messages to.
   * This exchange needs to be declared before setting it as dead-letter exchange.
   * 
   * @see https://www.rabbitmq.com/docs/dlx
   */
  exchange: string;
  /**
   * The routing key to use when routing messages to dead-letter exchange.
   * 
   * @see https://www.rabbitmq.com/docs/dlx#routing
   * @default undefined (using the original message's routing key.)
   */
  routingKey?: string;
}

export interface QueueDeclaration {
  /**
   * The queue name.
   */
  name: string;
  /**
   * If true, the queue will be deleted when the connection closes.
   * 
   * @see https://www.rabbitmq.com/docs/queues#exclusive-queues
   * @default false
   */
  exclusive?: boolean;
  /**
   * If false, the queue will be deleted when broker restarts.
   * 
   * @see https://www.rabbitmq.com/docs/queues#durability
   * @default true
   */
  durable?: boolean;
  /**
   * If true, the queue will be deleted when the number of consumers is zero.
   * 
   * @see https://www.rabbitmq.com/docs/queues#temporary-queues
   * @default false
   */
  autoDelete?: boolean;
  /**
   * If set, the queue will be deleted after n milliseconds of disuse (not being consumed or asserted).
   * 
   * @see https://www.rabbitmq.com/docs/ttl#queue-ttl
   * @default undefined
   */
  expires?: number;
  /**
   * If set, creates a priority queue where maxPriority is the maximum priority that can be set per message.
   * It is recommended for the maxPriority to be as low as possible (up to 255), as higher priority values require more CPU and RAM.
   * this is because RabbitMQ will need to internally maintain sub-queue for each priority value.
   * Messages published without a priority value will be treated with least priority.
   * Messages published with a priority value higher than maxPriority will be treated as the max priority.
   * 
   * @see https://www.rabbitmq.com/docs/priority
   * @default undefined
   */
  maxPriority?: number;
  /**
   * Max queue length.
   * Old messages will be routed to the dead-letter exchange (or discarded if not present) to make room for new messages.
   * 
   * @see https://www.rabbitmq.com/docs/maxlength
   * @default undefined
   */
  maxLength?: number;
  /**
   * Expires messages after n milliseconds.
   * Expired messages will be routed to the dead-letter exchange (or discarded if not present).
   * 
   * @see https://www.rabbitmq.com/docs/ttl
   * @default undefined
   */
  messageTtl?: number;
  /**
   * Options to use for message dead-lettering.
   * 
   * @see https://www.rabbitmq.com/docs/dlx
   * @default undefined
   */
  deadLettering?: QueueDeadLetteringOptions;
  /**
   * Any other arguments to send to the broker when creating this queue.
   */
  arguments?: QueueArguments;
}

export type ExchangeBindingArguments = any;

export interface ExchangeBindingDeclaration {
  /**
   * The exchange where messages will come from.
   */
  sourceExchange: string;
  /**
   * The exchange where messages will go to.
   */
  targetExchange: string;
  /**
   * A pattern to use for filtering messages that go from the sourceExchange to the targetExchange.
   * For example, in a topic exchange, messages that has a routing key that doesn't match this pattern will be filtered out.
   * 
   * @see https://www.rabbitmq.com/docs/e2e
   * @see https://www.rabbitmq.com/tutorials/tutorial-five-javascript
   * @default '#' (all messages from sourceExchange will be directed to targetExchange).
   */
  pattern?: string;
  /**
   * Any other arguments to send to the broker when creating this binding.
   */
  arguments?: ExchangeBindingArguments;
}

export type QueueBindingArguments = any;

export interface QueueBindingDeclaration {
  /**
   * The exchange where messages will come from.
   */
  sourceExchange: string;
  /**
   * The queue where messages will go to.
   */
  targetQueue: string;
  /**
   * A pattern to use for filtering messages that go from the sourceExchange to the targetQueue.
   * For example, in a topic exchange, messages that has a routing key that doesn't match this pattern will be filtered out.
   * 
   * @see https://www.rabbitmq.com/docs/e2e
   * @see https://www.rabbitmq.com/tutorials/tutorial-five-javascript
   * @default '#' (all messages from sourceExchange will be directed to targetQueue).
   */
  pattern?: string;
  /**
   * Any other arguments to send to the broker when creating this binding.
   */
  arguments?: QueueBindingArguments;
}

export type ConsumerArguments = any;

export interface ConsumerDeclaration {
  /**
   * The name of the queue this consumer will get messages from.
   */
  queueName: string;
  /**
   * The function which messages will be directed to.
   * Using this consumer function there are many ways to acknowledge messages.
   * 1. Using the ack object - call ack.resolve for basic.ack, use ack.reject for basic.nack.
   * 2. Returning a promise - a resolved promise will call basic.ack and a rejected promise will call basic.nack.
   * 
   * @see https://www.rabbitmq.com/docs/confirms
   * @returns 
   */
  consumer: () => void | Promise<void>;
  /**
   * If set to true, the broker will dequeue messages as soon as they hit the consumer without waiting for acknowledgement.
   * Make sure to only use this when message reliability is not a concern and higher throughput is needed (for example, updating a stock market share price realtime).
   * 
   * @see https://www.rabbitmq.com/docs/confirms#acknowledgement-modes
   * @default false
   */
  noAck?: boolean;
  /**
   * Gives priority to the consumer, higher priority consumers on the same queue will get messages before other lower priority consumers gets them.
   * 
   * @see https://www.rabbitmq.com/docs/consumer-priority
   * @default 0
   */
  priority?: number;
  /**
   * If true, the broker will not allow creating another consumer on this queue.
   * If there's already a consumer for this queue, this consumer will fail to declare.
   * 
   * @see https://www.rabbitmq.com/docs/consumers#exclusivity
   * @default false
   */
  exclusive?: boolean;
  /**
   * Any other arguments to send to the broker when creating this consumer.
   */
  arguments?: ConsumerArguments;
}

export interface RabbitMQDeclarations {
  exchanges: Array<ExchangeDeclaration>;
  queues: Array<QueueDeclaration>;
  queueBindings: Array<QueueBindingDeclaration>;
  exchangeBindings: Array<ExchangeBindingDeclaration>;
  consumers: Array<ConsumerDeclaration>;
}

export interface DeclarationBuilderFunctions {
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