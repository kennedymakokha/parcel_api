
import { Socket } from "socket.io";
import { MakeActivationCode } from "../utils/generate_activation.util";
import { ChatMessage } from "../types";
import { encryptMessage } from "../utils/encrypt.util";

let io: any = null;
let users: { [key: string]: string } = {};

const connectedDevices: any = {};
console.log(connectedDevices)
export const setupSocket = (socketInstance: any) => {
    io = socketInstance;
    io.on("connection", (socket: any) => {
        console.log("SOCKET CONNECTION MADE:", socket.id);

        socket.on('registerDevice', (deviceId: any) => {
            console.log(`Device registered: ${deviceId}`);
            connectedDevices[deviceId] = socket.id;
        });

        socket.on('join_topic', (topic: any) => {
            socket.join(topic);
            console.log(`User ${socket.id} joined topic: ${topic}`);
            // Optional: Notify others in the room
            socket.to(topic).emit('user_joined', {
                message: `User ${socket.id} has joined the topic ${topic}`,
            });
        });

        socket.on('send_message', ({ topic, message }: any) => {
            io.to(topic).emit('receive_message', {
                sender: socket.id,
                message,
            });
        });

        socket.on("disconnect", () => {
            console.log("Disconnected from server");
            for (const [key, value] of Object.entries(connectedDevices)) {
                if (value === socket.id) delete connectedDevices[key];
            }
        });

    });






};

export const emitToDevice = (deviceId: string, event: string, payload: any) => {
    const socketId = connectedDevices[deviceId];
    if (socketId && io) {
        io.to(socketId).emit(event, payload);
        console.log(`Emitted event "${event}" to device "${deviceId}"`, payload);
        return true;
    } else {
        console.warn(`Device ${deviceId} not connected`);
        return false;
    }
};
export const getSocketIo = () => io;
