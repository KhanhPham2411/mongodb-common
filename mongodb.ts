
export const MongoClient = require('mongodb').MongoClient;
export const MongoUrl = "mongodb://localhost:27017/";

let MongoClientDb = null;
export async function getDb() {
	if(MongoClientDb == null) {
		MongoClientDb = await MongoClient.connect(MongoUrl);
		
	}
	return MongoClientDb
}

export async function mongoDbTransaction(func) {
	var db = await MongoClient.connect(MongoUrl).catch(err => { console.log(err); });
	var dbo = db.db("mydb");

	await func(dbo).catch(err => { console.log(err); throw err; });

	db.close();
}
