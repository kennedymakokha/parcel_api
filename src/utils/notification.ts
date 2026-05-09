import admin from "firebase-admin";
import { NotificationModel } from "../models/notification.model";
import { getSocketIo } from "../config/socket";


export const sendTopicNotification = async ({ topic, title, body, audience, socket_topic_id, event_name }: any) => {
    try {
        console.log("Sending to topic:", topic);

        const v = await admin.messaging().send({
            topic,
            notification: {
                title,
                body,
            },
        });
        console.log("object", v);
        const notification = new NotificationModel({
            topic,
            body,
            title,
            audience,
        });

        // await notification.save();
        const io = getSocketIo();
        
        io.to("socket_topic_id").emit(event_name, body);
        // pickup_${pickupId}
    } catch (error) {
        console.error('Error sending notification:', error);
    }
};



const sendPushNotification = async ({ token, title, body, data = {} }: any) => {
    try {
        const message = {
            token,
            notification: {
                title,
                body,
            },
            data,
        };

        const response = await admin.messaging().send(message);
        console.log('Successfully sent message:', response);
        return response;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};