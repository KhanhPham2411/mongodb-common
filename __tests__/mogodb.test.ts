import { mongoDbTransaction } from "../mogodb";

it.skip("mongodb-insertOne", async () => {
	await mongoDbTransaction(async (dbo) => {
		var myobj = { name: "Company Inc", address: "Highway 37" };
		var result = await dbo.collection("customers").insertOne(myobj);
		console.log("1 document inserted");
	})
})

it.skip("mongodb-findOne", async () => {
	await mongoDbTransaction(async (dbo) => {
		var query = { address: "Highway 37" };
		var result = await dbo.collection("customers").findOne(query);
		console.log(result);
	})
})