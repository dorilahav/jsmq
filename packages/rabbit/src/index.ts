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


const client = new RabbitMQClient({url: 'amqp://makmachat-realtime:i9kgRdBE84eq5JdK@compute-1.k8s.dorilahav.com:30672/makmachat-test'});

client.declare(consumerDeclaration);

client.connect()
  .then(() => console.log('Connected!'));