import { createDeclaration, RabbitMQDeclarationBuilder } from './declarations';

describe('RabbitMQDeclarationBuilder', () => {
  let builder: RabbitMQDeclarationBuilder;

  beforeEach(() => {
    builder = new RabbitMQDeclarationBuilder();
  });

  it('creates an exchange declaration when calling declareExchange', () => {
    const name = 'test-exchange';

    const declarations = builder.declareExchange({name}).build();

    expect(declarations.exchanges).toHaveLength(1)
    expect(declarations.exchanges[0]).toEqual({name});
  });

  it('creates a queue declaration when calling declareQueue', () => {
    const name = 'test-queue';

    const declarations = builder.declareQueue({name}).build();

    expect(declarations.queues).toHaveLength(1)
    expect(declarations.queues[0]).toEqual({name});
  });

  it('creates a queue binding declaration when calling bindQueueToExchange', () => {
    const sourceExchange = 'test-source-exchange';
    const targetQueue = 'test-target-queue';

    const declarations = builder.bindQueueToExchange({sourceExchange, targetQueue}).build();

    expect(declarations.queueBindings).toHaveLength(1);
    expect(declarations.queueBindings[0]).toEqual({sourceExchange, targetQueue});
  });

  it('creates an exchange binding declaration when calling bindExchangeToExchange', () => {
    const sourceExchange = 'test-source-exchange';
    const targetExchange = 'test-target-exchange';

    const declarations = builder.bindExchangeToExchange({sourceExchange, targetExchange}).build();

    expect(declarations.exchangeBindings).toHaveLength(1);
    expect(declarations.exchangeBindings[0]).toEqual({sourceExchange, targetExchange});
  });

  it('creates a consumer declaration when calling consume', () => {
    const queueName = 'test-queue';
    const consumer = () => {
      console.log('test');
    };

    const declarations = builder.consume({queueName, consumer}).build();

    expect(declarations.consumers).toHaveLength(1);
    expect(declarations.consumers[0]).toEqual({queueName, consumer});
  });

  it('creates many declarations when chaining them together', () => {
    const sourceExchange = 'test-source-exchange';
    const middleExchange = 'test-middle-exchange';
    const targetQueue = 'test-queue';
    const consumer = () => {
      console.log('test');
    }

    const declarations = builder
      .declareExchange({name: sourceExchange})
      .declareExchange({name: middleExchange})
      .declareQueue({name: targetQueue})
      .bindExchangeToExchange({sourceExchange, targetExchange: middleExchange})
      .bindQueueToExchange({sourceExchange: middleExchange, targetQueue})
      .consume({queueName: targetQueue, consumer})
      .build();

    expect(declarations.exchanges).toHaveLength(2);
    expect(declarations.exchanges[0]).toEqual({name: sourceExchange});
    expect(declarations.exchanges[1]).toEqual({name: middleExchange});

    expect(declarations.queues).toHaveLength(1);
    expect(declarations.queues[0]).toEqual({name: targetQueue});

    expect(declarations.exchangeBindings).toHaveLength(1);
    expect(declarations.exchangeBindings[0]).toEqual({sourceExchange, targetExchange: middleExchange});

    expect(declarations.queueBindings).toHaveLength(1);
    expect(declarations.queueBindings[0]).toEqual({sourceExchange: middleExchange, targetQueue});

    expect(declarations.consumers).toHaveLength(1);
    expect(declarations.consumers[0]).toEqual({queueName: targetQueue, consumer});
  });
});

describe('createDeclaration', () => {
  it('returns itself', () => {
    const originalBuilder = () => {};
    
    const builder = createDeclaration(originalBuilder);

    expect(builder).toBe(originalBuilder);
  })
})