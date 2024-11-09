import { AcquireChannelResponse, ChannelPool } from './channel-pool';

describe('ChannelPool', () => {
  let createConfirmChannelReturn: any;
  let createConfirmChannel: any;
  let durableConnection: any;
  let pool: ChannelPool;

  beforeEach(() => {
    createConfirmChannelReturn = {once: jest.fn()}
    createConfirmChannel = jest.fn().mockResolvedValue(createConfirmChannelReturn);
    durableConnection = {
      get: jest.fn().mockResolvedValue({ createConfirmChannel })
    };

    pool = new ChannelPool(durableConnection as any, {maxSize: 1});
  });
  
  describe('acquire', () => {
    it('succeeds to acquire when no free channels', async () => {
      const channel = await pool.acquire();

      expect(channel.channel).toEqual(createConfirmChannelReturn);
      expect(createConfirmChannel).toHaveBeenCalledTimes(1);
    });

    it('succeeds to acquire when has free channels', async () => {
      const {id} = await pool.acquire();
      pool.release(id);
      
      const channel = await pool.acquire();

      expect(channel.channel).toEqual(createConfirmChannelReturn);
      expect(createConfirmChannel).toHaveBeenCalledTimes(1);
    });

    it('fails to acquire when pool reached max size', async () => {
      await pool.acquire()

      await expect(pool.acquire).rejects.toThrow();
      expect(createConfirmChannel).toHaveBeenCalledTimes(1);
    });
  });

  describe('release', () => {
    let channel: AcquireChannelResponse;

    beforeEach(async () => {
      channel = await pool.acquire();
    });

    it('succeeds to release acquired channel', () => {
      expect(() => pool.release(channel.id)).not.toThrow();
    });

    it('fails to release channel that has already been released', async () => {
      pool.release(channel.id);

      expect(() => pool.release(channel.id)).toThrow();
    });
  });
});