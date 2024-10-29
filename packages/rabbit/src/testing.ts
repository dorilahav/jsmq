import { RabbitMQClient } from './client';
import { createDeclaration } from './declarations';

const sourceExchange = 'one';
const middleExchange = 'two';
const targetQueue = 'three';

const consumer = () => {
  console.log('shit');
}

const consumerDeclaration = createDeclaration(
  setup => {
    setup
      .declareExchange({name: sourceExchange})
      .declareExchange({name: middleExchange})
      .declareQueue({name: targetQueue})
      .bindExchangeToExchange({sourceExchange, targetExchange: middleExchange})
      .bindQueueToExchange({sourceExchange: middleExchange, targetQueue})
      .consume({queueName: targetQueue, consumer});
  }
);

const sourceExchange2 = 'one2';
const middleExchange2 = 'two2';
const targetQueue2 = 'three2';

const consumer2 = () => {
  console.log('shit2');
}

const consumer2Declaration = createDeclaration(
  setup => {
    setup
      .declareExchange({name: sourceExchange2})
      .declareExchange({name: middleExchange2})
      .declareQueue({name: targetQueue2})
      .bindExchangeToExchange({sourceExchange: sourceExchange2, targetExchange: middleExchange2})
      .bindQueueToExchange({sourceExchange: middleExchange2, targetQueue: targetQueue2})
      .consume({queueName: targetQueue2, consumer: consumer2});
  }
);


const client = new RabbitMQClient({url: 'amqp://makmachat-realtime:i9kgRdBE84eq5JdK@compute-1.k8s.dorilahav.com:30672/makmachat-test'});

client.declare(consumerDeclaration);
client.declare(consumer2Declaration);

client.connect()
  .then(() => console.log('Connected!'));