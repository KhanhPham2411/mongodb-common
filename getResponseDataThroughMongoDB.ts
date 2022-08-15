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

export interface ResponseJson {
  msg: string;
  data: any;
  error: number;
  status: number;
}