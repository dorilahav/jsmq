import { ConfirmChannel } from 'amqplib';
import { IDurableConnection } from './durable-connection';

/**
 * ChannelPool(connection, size):
 *  acquire channel:
 *    if has free channel:
 *      return free channel
 *    else
 *      if limit reached:
 *        throw error
 *      create new channel
 *  
 *  release channel:
 *    if channel is freed:
 *      throw error
 *    return channel to pool
 * 
 *  on connection close:
 *    close all channels.
 *  
 *  on channel close:
 *    remove from free channels
 *    remove from channelMap
 *    create alternative channel.
 *    insert into channelMap
 *    insert into free channels
 */

/**
 * @constant
 * @default
 */
export const DEFAULT_POOL_MAX_SIZE = 5;

export interface ChannelPoolOptions {
  /**
   * This indicates the max size of channels the pool is capable of holding.
   * Aquiring channels will fail if maxSize of connection is reached and there are no free channels.
   * 
   * @default DEFAULT_POOL_MAX_SIZE
   */
  maxSize?: number;
}

export interface AcquireChannelResponse {
  id: string;
  channel: ConfirmChannel;
}

interface IChannelPool<T> {
  acquire: () => Promise<T>;
  release: (id: string) => void;
  size: number;
}

export class ChannelPool implements IChannelPool<AcquireChannelResponse> {
  private maxSize: number;

  private connection: IDurableConnection;
  private channelsMap: Map<string, ConfirmChannel>;
  private freeChannels: Array<string>;

  constructor(connection: IDurableConnection, options: ChannelPoolOptions = {}) {
    this.connection = connection;
    this.maxSize = options.maxSize ?? DEFAULT_POOL_MAX_SIZE;

    this.channelsMap = new Map();
    this.freeChannels = [];
  }

  public get size() {
    return this.channelsMap.size;
  }

  public async acquire(): Promise<AcquireChannelResponse> {
    const freeChannel = this.popFreeChannel();

    if (freeChannel != null) {
      return freeChannel;
    }

    if (this.channelsMap.size >= this.maxSize) {
      throw new Error(); // TODO: throw another error.
    }

    return await this.createAcquiredChannel();
  }

  public release(id: string) {
    if (this.freeChannels.includes(id)) {
      throw new Error(); // TODO: throw another error.
    }

    this.freeChannels.push(id);
  }

  private popFreeChannel(): AcquireChannelResponse | null {
    const channelId = this.freeChannels.pop();

    if (channelId === undefined) {
      return null;
    }

    return {
      id: channelId,
      channel: this.channelsMap.get(channelId)!
    };
  }

  private async createAcquiredChannel(): Promise<AcquireChannelResponse> {
    const connection = await this.connection.get();
    const channel = await connection.createConfirmChannel();

    const channelId = Math.random().toString();

    channel.once('close', async () => {
      const channelIndex = this.freeChannels.indexOf(channelId);
      if (channelIndex !== -1) {
        this.freeChannels.splice(channelIndex, 1);
      }

      this.channelsMap.delete(channelId);
    });

    this.channelsMap.set(channelId, channel);

    return {
      id: channelId,
      channel: channel
    };
  }
}