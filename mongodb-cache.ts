import { mongoDbTransaction } from './mogodb';
const NodeCache = require( "node-cache" );
const AsyncLock = require('async-lock');
import {} from 'node-cache'

const lock = new AsyncLock();

export class MongoDbCache {
  private static _instance: MongoDbCache;
  private cache;
  private tableName = "MongoDbCache";

  private constructor(ttlSeconds: number) {
    this.cache = new NodeCache({
      stdTTL: ttlSeconds,
      checkperiod: ttlSeconds * 0.2,
      useClones: false
    })
  }
  
  public static getInstance(): MongoDbCache {
    if (!MongoDbCache._instance) {
      MongoDbCache._instance = new MongoDbCache(0);
    }
    return MongoDbCache._instance
  }
  public clear() {
    MongoDbCache._instance = null;
  }

  // ttl in seconds
  public async readThrough(key, func, ttl=0) {

    return await lock.acquire(key , async () => {
      let value = null;

      await mongoDbTransaction(async dbo => {
        const data = await dbo.collection(this.tableName).findOne({key});
        let isExpiredTime = false;

        if(data) {
          isExpiredTime = this.checkExpiredTime(data.lastModified, Date.now(), ttl);
        }

        if(data == null || isExpiredTime) {
          value = await func();

          var date = new Date();
          await dbo.collection(this.tableName).replaceOne({key}, {
            key,
            value,
            lastModified: date.getTime(),
            lastModifiedString: date.toString()
          }, {upsert: true});
        }
        else {
          value = data.value;
        }
      })

      return value;
    })
  }
  public async get(key) {
    let data = null;
    await mongoDbTransaction(async dbo => {
      data = await dbo.collection(this.tableName).findOne({key});
    });

    return data.value;
  }

  public async set(key, value) {
    await mongoDbTransaction(async dbo => {
      var date = new Date();

      await dbo.collection(this.tableName).replaceOne({key}, {
        key,
        value,
        lastModified: date.getTime(),
        lastModifiedString: date.toString()
      }, {upsert: true});
    });
  }

  public checkExpiredTime(date1: number, date2: number, ttl: number) {
    const diffTime = Math.abs(date2 - date1);
    const diffSeconds = Math.ceil(diffTime / (1000)); 

    if(diffSeconds > ttl) {
      return true;
    }

    return false;
  }
}

