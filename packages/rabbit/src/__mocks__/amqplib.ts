const amqplib = jest.createMockFromModule('amqplib');

export const createConfirmChannel = jest.fn().mockResolvedValue({});

export const connect = jest.fn().mockResolvedValue({
  createConfirmChannel
});

export default amqplib;