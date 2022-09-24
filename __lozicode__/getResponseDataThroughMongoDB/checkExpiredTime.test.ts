
import * as getResponseDataThroughMongoDB from "../../getResponseDataThroughMongoDB"


describe("getResponseDataThroughMongoDB.checkExpiredTime", () =>  {
  it("default", async () => {
    const actualOutput = await getResponseDataThroughMongoDB.checkExpiredTime(1663991855158,1663991900294,46);
    console.log(actualOutput);
  });
})