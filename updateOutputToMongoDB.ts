import { mongoDbTransaction } from './mogodb';


export async function updateOutputToMongoDB(input, reactFunc) : Promise<any> {
  const tableName = reactFunc.name;
  let output = null;

  await mongoDbTransaction(async dbo => {
    const output = await reactFunc(input);

    await dbo.collection(tableName).replaceOne(input, {
      ...input,
      output
    }, {upsert: true});
  })
  
  return output;
}

export async function updateOutputToMongoDBv2(input, reactFuncName, output) : Promise<any> {
  const tableName = reactFuncName;

  await mongoDbTransaction(async dbo => {
    await dbo.collection(tableName).replaceOne(input, {
      ...input,
      output
    }, {upsert: true});
  })
  
  return output;
}

export async function getOutputFromMongoDB(input, reactFuncName: string) : Promise<any> {
  const tableName = reactFuncName;
  let output = null;

  await mongoDbTransaction(async dbo => {
    const data = await dbo.collection(tableName).findOne(input);
    output = data.output;
  })
  
  return output;
}