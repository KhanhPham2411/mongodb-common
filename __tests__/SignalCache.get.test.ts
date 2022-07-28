import { MongoDbCache } from '../mongodb-cache';

class SignalCache {
  static async get() {
    return MongoDbCache.getInstance().readThrough('SignalCache.get', async () => {
      return await SignalDatabase.get();
    }, 5)
  }
}
class SignalDatabase {
  static get() {
    return 1;
  }
}

async function sleep(sec) {
  return new Promise(resolve => setTimeout(resolve, sec*1000));
}

describe("SignalCache.get", () => {
  let signalJest = jest.spyOn(SignalDatabase, "get");

  beforeEach(() => {
    signalJest = jest.spyOn(SignalDatabase, "get");
  })
  afterEach( () => {
    MongoDbCache.getInstance().clear();
    signalJest.mockClear();
  });

  it("SignalDatabase.get should be called 1", async () => {
    await SignalCache.get();
    await SignalCache.get();
  
    expect(SignalDatabase.get).toBeCalledTimes(1);
    await sleep(6);
  }, 30000);
  
  it("Time to leave should expire the cache", async () => {
    await SignalCache.get();
    await sleep(6); // > readThrough('SignalCache.get', async () => {}, 5)
    await SignalCache.get();
  
    expect(SignalDatabase.get).toBeCalledTimes(2);
    await sleep(6);
  }, 30000);
  
  it("Should lock concurrent request", async () => {
    const task1 = SignalCache.get();
    const task2 = SignalCache.get();
    const task3 = SignalCache.get();
    const allTasks = await Promise.all([task1, task2, task3]);
  
    expect(SignalDatabase.get).toBeCalledTimes(1);
    await sleep(6);
  }, 30000);
  
})


