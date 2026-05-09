// cron/pickupPaidReset.js

import cron from "node-cron";
import { PickuUpModel } from "../models/pickups.model";
import { sendTopicNotification } from "../utils/notification";

/**
 * Runs every minute
 */
cron.schedule("* * * * *", async () => {
    try {
        const now = new Date();
        console.log("NOW", now)
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        console.log("NOW", currentMinute)
        // We only care about the last minute of the hour
        if (currentMinute !== 59) return;

        // Find active pickups
        const pickups = await PickuUpModel.find({
            state: "active",
            deletedAt: null,
            paid: true,
        });

        for (const pickup of pickups) {
            const workingHours = pickup.working_hrs; // e.g. "8-17"
            console.log(pickup);
            if (!workingHours) continue;

            const [startHour, endHour] = workingHours
                .split("-")
                .map(Number);

            /**
             * Last minute before closing
             * Example:
             * 8-17 => trigger at 16:59
             */
            
            const triggerHour = endHour - 1;

            if (currentHour === triggerHour) {
                pickup.paid = false;
                await pickup.save();
                const pickupId = pickup._id.toString();
                await sendTopicNotification({
                    topic: `pickup_${pickupId}_attendants`,
                    socket_topic_id: `pickup_${pickupId}`,
                    event_name: "pickup_shut",
                    audience: `${pickup.pickup_name}`,
                    title: 'Shutting Down system',
                    body: `Hello ${pickup.pickup_name},\Today's shift has now ended.\nThank you for your support today.\nAny pending matters have been forwarded to tomorrow.`
                });
                console.log(
                    `Updated paid=false for ${pickup.pickup_name}`
                );
            }
        }
    } catch (error) {
        console.error("Cron job error:", error);
    }
});