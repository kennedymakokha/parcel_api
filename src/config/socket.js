"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSocketIo = exports.emitToDevice = exports.setupSocket = void 0;
var io = null;
var users = {};
var connectedDevices = {};
console.log(connectedDevices);
var setupSocket = function (socketInstance) {
    io = socketInstance;
    io.on("connection", function (socket) {
        var _a;
        console.log("SOCKET CONNECTION MADE:", socket.id);
        var pickupId = (_a = socket.handshake.auth) === null || _a === void 0 ? void 0 : _a.pickupId;
        if (pickupId) {
            var roomName = "pickup_".concat(pickupId);
            socket.join(roomName);
            console.log("Auto-joined ".concat(socket.id, " to ").concat(roomName));
        }
        socket.on('registerDevice', function (deviceId) {
            console.log("Device registered: ".concat(deviceId));
            connectedDevices[deviceId] = socket.id;
        });
        socket.on("join_pickup_room", function (_a) {
            var pickupId = _a.pickupId;
            var roomName = "pickup_".concat(pickupId);
            socket.join(roomName);
            console.log("\u2705 ".concat(socket.id, " joined ").concat(roomName));
            // 👇 send confirmation
            socket.emit("joined_pickup", {
                room: roomName,
            });
        });
        // socket.on("join_pickup_room", ({ pickupId }: any) => {
        //     if (!pickupId) return;
        //     const roomName = `pickup_${pickupId}`;
        //     socket.join(roomName);
        //     console.log(`Socket ${socket.id} joined pickup room: ${roomName}`);
        //     socket.to(roomName).emit("user_joined", {
        //         message: `User ${socket.id} joined pickup ${pickupId}`
        //     });
        // });
        socket.on('join_topic', function (topic) {
            socket.join(topic);
            console.log("User ".concat(socket.id, " joined topic: ").concat(topic));
            // Optional: Notify others in the room
            socket.to(topic).emit('user_joined', {
                message: "User ".concat(socket.id, " has joined the topic ").concat(topic),
            });
        });
        socket.on('send_message', function (_a) {
            var topic = _a.topic, message = _a.message;
            io.to(topic).emit('receive_message', {
                sender: socket.id,
                message: message,
            });
        });
        socket.on("disconnect", function () {
            console.log("Disconnected from server");
            for (var _i = 0, _a = Object.entries(connectedDevices); _i < _a.length; _i++) {
                var _b = _a[_i], key = _b[0], value = _b[1];
                if (value === socket.id)
                    delete connectedDevices[key];
            }
        });
    });
};
exports.setupSocket = setupSocket;
var emitToDevice = function (deviceId, event, payload) {
    var socketId = connectedDevices[deviceId];
    if (socketId && io) {
        io.to(socketId).emit(event, payload);
        console.log("Emitted event \"".concat(event, "\" to device \"").concat(deviceId, "\""), payload);
        return true;
    }
    else {
        console.warn("Device ".concat(deviceId, " not connected"));
        return false;
    }
};
exports.emitToDevice = emitToDevice;
var getSocketIo = function () { return io; };
exports.getSocketIo = getSocketIo;
