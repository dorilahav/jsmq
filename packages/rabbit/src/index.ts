import { RabbitMQClient } from './client';
import { createDeclaration } from './declarations';

const queue1Declaration = createDeclaration(
  setup => {
    setup.declareQueue({name: 'queue-1'})
      .bindQueueToExchange({sourceExchange: 'dd', targetQueue: 'queue-1'})
      .consume({
        queueName: 'queue-1',
        consumer() {
          console.log('something happened')
        }
      })
  }
);


const client = new RabbitMQClient();

client.declare(queue1Declaration);

console.log(client);