import cron from "node-cron";
import { BusinessModel } from "../models/business.model";
import { UsageModel } from "../models/usageModel";
import { User } from "../models/user.model";

cron.schedule("0 * * * *", async () => {
  console.log("Running usage calculation...");

  const businesses = await BusinessModel.find();

  for (const biz of businesses) {
    const users = await User.find({ business: biz._id });

    // Estimate size
    const sizeBytes = Buffer.byteLength(JSON.stringify(users));

    await UsageModel.updateOne(
      { business: biz._id },
      {
        storage_bytes: sizeBytes,
        users_count: users.length,
        last_calculated: new Date()
      },
      { upsert: true }
    );
  }
});