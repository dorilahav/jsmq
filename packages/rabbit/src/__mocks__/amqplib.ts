const amqplib = jest.createMockFromModule('amqplib');

export const connect = jest.fn().mockReturnValue({});

export default amqplib;