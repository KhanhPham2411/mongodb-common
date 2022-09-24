import { mongoDbTransaction } from './mongodb';

export async function getResponseThroughMongoDBv2(input, request, forceRequest=null) : Promise<ResponseJson> {
  const tableName = request.name;
  let response = null;
  await mongoDbTransaction(async dbo => {
    const collection = await dbo.collection(tableName).findOne(input);
    if(collection == null || forceRequest) {
      response = await request(input);
      const saveReponse = response ? {
        msg: response.msg,
        data: response.data,
        error: response.error,
        status: response.status,
      } : null;

      await dbo.collection(tableName).replaceOne(input, {
        ...input,
        response: saveReponse
      }, {upsert: true});

      response = saveReponse;
    }
    else {
      response = collection.response;
    }
  })
  
  return response;
}

export async function getResponseThroughMongoDB(id, request, forceRequest=null) : Promise<ResponseJson> {
  id = id.toString();
  const input = { id };
  const tableName = request.name;
  let response = null;
  await mongoDbTransaction(async dbo => {
    const collection = await dbo.collection(tableName).findOne(input);
    if(collection == null || forceRequest) {
      response = await request(id);
      const saveReponse = response ? {
        msg: response.msg,
        data: response.data,
        error: response.error,
        status: response.status,
      } : null;

      await dbo.collection(tableName).replaceOne(input, {
        ...input,
        response: saveReponse
      }, {upsert: true});

      response = saveReponse;
    }
    else {
      response = collection.response;
    }
  })
  
  return response;
}

export async function getResultThroughMongoDB(id, func) : Promise<any> {
  const query = { id };
  const tableName = func.name;
  let result = null;
  await mongoDbTransaction(async dbo => {
    const collection = await dbo.collection(tableName).findOne(query);
    if(collection == null) {
      result = await func(id);

      await dbo.collection(tableName).insertOne({
        id,
        result
      });
    }
    else {
      result = collection.result;
    }
  })
  
  return result;
}
export async function getResultThroughMongoDBv2(input, func, forceRequest=null) : Promise<any> {
  const tableName = func.name;
  let result = null;
  await mongoDbTransaction(async dbo => {
    const collection = await dbo.collection(tableName).findOne(input);
    if(collection == null || forceRequest) {
      result = await func(input);

      await dbo.collection(tableName).replaceOne(input, {
        ...input,
        result
      }, {upsert: true});
    }
    else {
      result = collection.result;
    }
  })
  
  return result;
}

// ttl in seconds
export async function getResultThroughMongoDBv3(input, func, {forceRequest=false, key=null, ttl=-1, prefixKey=""}) : Promise<any> {
  let tableName;
  if(key) {
    tableName = key;
  } else {
    tableName = prefixKey + func.name;
  }

  let result = null;
  await mongoDbTransaction(async dbo => {
    const collection = await dbo.collection(tableName).findOne(input);

    let isExpiredTime = false;
    if(collection) {
      isExpiredTime = checkExpiredTime(collection.lastModified, Date.now(), ttl);
    }

    if(collection == null || forceRequest || isExpiredTime) {
      result = await func(input);
      
      var date = new Date();
      await dbo.collection(tableName).replaceOne(input, {
        ...input,
        result,
        lastModified: date.getTime(),
        lastModifiedString: date.toString()
      }, {upsert: true});
    }
    else {
      result = collection.result;
    }
  })
  
  return result;
}

// ttl in seconds
export function checkExpiredTime(date1: number, date2: number, ttl: number) {
  if(ttl < 0) {
    return false;
  }
  if(date1 == null || date2 == null || ttl == 0) {
    return true;
  }

  const diffTime = Math.abs(date2 - date1);
  const diffSeconds = Math.ceil(diffTime / (1000)); 

  if(diffSeconds > ttl) {
    return true;
  }

  return false;
}

export interface ResponseJson {
  msg: string;
  data: any;
  error: number;
  status: number;
}