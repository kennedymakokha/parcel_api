import cron from "node-cron";
import { PickuUpModel } from "../models/pickups.model";
import { sendTopicNotification } from "../utils/notification";
import { Parcels } from "../models/parcel.model";
import mongoose from "mongoose";

export const startPickupPaidResetCron = () => {
    cron.schedule("* * * * *", async () => {
        try {

            const currentHour = Number(
                new Intl.DateTimeFormat('en-US', {
                    hour: 'numeric',
                    hour12: false,
                    timeZone: 'Africa/Nairobi'
                }).format(new Date())
            );
            const now = new Date();

            const currentMinute = now.getMinutes();



            const pickups = await PickuUpModel.find({
                // state: "active",
                deletedAt: null,
                // paid: true,
            });

            for (const pickup of pickups) {
                const workingHours = pickup.working_hrs;

                if (!workingHours) continue;

                const [startHour, endHour] = workingHours
                    .split("-")
                    .map(Number);

                const triggerHour = endHour - 1;
                if (currentHour === triggerHour && currentMinute === 59) {
                    pickup.paid = false;

                    await pickup.save();

                    const pickupId = pickup._id.toString();

                    await sendTopicNotification({
                        topic: `pickup_${pickupId}_attendants`,
                        socket_topic_id: `pickup_${pickupId}`,
                        event_name: "pickup_shut",
                        audience: `${pickup.pickup_name}`,
                        title: "System Shutting Down ",
                        body: `Hello ${pickup.pickup_name},\nToday's shift has now ended.\nThank you for your support today.\nAny pending matters have been forwarded to tomorrow.`,
                    });

                    const nairobiNow = new Date(
                        now.toLocaleString("en-US", { timeZone: "Africa/Nairobi" })
                    );

                    const start = new Date(nairobiNow);
                    start.setHours(0, 0, 0, 0);

                    const end = new Date(nairobiNow);
                    end.setHours(23, 59, 59, 999);

                    const count = await Parcels.countDocuments({
                        sentFrom: new mongoose.Types.ObjectId(pickupId),
                        createdAt: {
                            $gte: start,
                            $lte: end,
                        },
                    });
                    console.log(count);
                    console.log(`Updated paid=false for ${pickup.pickup_name}`);
                }

            }
        } catch (error) {
            console.error("Cron job error:", error);
        }
    });
};