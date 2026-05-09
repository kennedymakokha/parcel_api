import cron from "node-cron";
import { PickuUpModel } from "../models/pickups.model";
import { sendTopicNotification } from "../utils/notification";

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
            // console.log(now);
            // const currentHour = now.getHours();
            // const currentHour = new Date().getUTCHours();
            const currentMinute = now.getMinutes();
            // console.log(currentMinute);


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
                console.log(currentHour === triggerHour && currentMinute === 36, `${currentHour}:${currentMinute}`);
                if (currentHour === triggerHour && currentMinute === 36) {
                    pickup.paid = false;

                    await pickup.save();

                    const pickupId = pickup._id.toString();

                    await sendTopicNotification({
                        topic: `pickup_${pickupId}_attendants`,
                        socket_topic_id: `pickup_${pickupId}`,
                        event_name: "pickup_shut",
                        audience: `${pickup.pickup_name}`,
                        title: "Shutting Down system",
                        body: `Hello ${pickup.pickup_name},\nToday's shift has now ended.\nThank you for your support today.\nAny pending matters have been forwarded to tomorrow.`,
                    });

                    console.log(`Updated paid=false for ${pickup.pickup_name}`);
                }

            }
        } catch (error) {
            console.error("Cron job error:", error);
        }
    });
};