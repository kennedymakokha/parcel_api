import { BillingModel } from "../models/billingModel";
import { BusinessModel } from "../models/business.model";
import { UsageModel } from "../models/usageModel";
import cron from "node-cron";
const PRICE_PER_MB = 0.02;   // $0.02 per MB
const PRICE_PER_USER = 0.01; // $0.01 per user
const BASE_PRICE = 5;        // $5 minimum
const calculateBill = (usage: any) => {
    const mb = usage.storage_bytes / (1024 * 1024);

    let cost = 0;

    cost += mb * PRICE_PER_MB;
    cost += usage.users_count * PRICE_PER_USER;

    return Math.max(cost, BASE_PRICE);
};


cron.schedule("0 0 1 * *", async () => {
    console.log("Generating monthly invoices...");

    const businesses = await BusinessModel.find();

    const month = new Date().toISOString().slice(0, 7);

    for (const biz of businesses) {
        const usage = await UsageModel.findOne({ business: biz._id });

        if (!usage) continue;

        const amount = calculateBill(usage);

        const mb = usage.storage_bytes / (1024 * 1024);

        await BillingModel.create({
            business: biz._id,
            month,
            storage_mb: Math.ceil(mb),
            users: usage.users_count,
            amount,
            status: "pending"
        });
    }
});
