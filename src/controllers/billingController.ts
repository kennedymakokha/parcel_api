import { BillingModel } from "../models/billingModel";
import { BusinessModel } from "../models/business.model";





export const getBillingOverview = async (req: Request | any, res: Response | any) => {

    try {
        const totalRevenue = await BillingModel.aggregate([
            { $match: { status: "paid" } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const unpaid = await BillingModel.countDocuments({ status: "pending" });

        const businesses = await BusinessModel.countDocuments();


        res.status(201).json(
            {
                revenue: totalRevenue[0]?.total || 0,
                unpaid,
                businesses
            }
        );
        return;
    } catch (error) {
        console.log(error)
        res.status(500).json({ ok: false, message: "Server error", error });
        return;

    }
};