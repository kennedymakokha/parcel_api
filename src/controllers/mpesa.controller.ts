// import { User } from "../models/user.model";
// import { Request, Response } from "express";
// import Mpesa_stk from "../utils/stk.util";
// import { getSocketIo } from "../config/socket";
// import MpesaLogs from "../models/mpesaLogs.model";




// export const mpesa_callback = async (req: Request | any, res: Response | any) => {
//     try {
//         let io = await getSocketIo()
//         const Logs = await MpesaLogs.find({
//             MerchantRequestID: req.body.Body?.stkCallback?.MerchantRequestID
//         })
//         let updated
//         for (let i = 0; i < Logs.length; i++) {

//             updated = await MpesaLogs.findOneAndUpdate(
//                 {
//                     _id: Logs[i]._id
//                 }, {
//                 log: JSON.stringify(req.body), ResultDesc: req.body.Body?.stkCallback?.ResultDesc,
//                 ResponseCode: req.body.Body?.stkCallback?.ResultCode,
//                 MpesaReceiptNumber: req.body.Body?.stkCallback?.CallbackMetadata?.Item[1]?.Value
//             }, { new: true, useFindAndModify: false })
//             const vendor: any = await User.findOne({ _id: updated.vendor })
//             const user: any = await User.findOne({ _id: updated.user })

//             if (req.body.Body?.stkCallback?.ResultCode === 0) {
//                 let current = user?.amount | 0
//                 let newAmount = current + updated?.amount
//                 let currentvendor = vendor?.amount | 0
//                 let newAmountvendor = currentvendor + updated.amount
//                 let userPoints: any = user?.points | 0
//                 let newpoints = userPoints + 0.01 * parseFloat(updated.amount)
//                 await User.findOneAndUpdate({ _id: updated.vendor, role: "admin" }, { amount: newAmountvendor }, { new: true, useFindAndModify: false })
//                 await User.findOneAndUpdate({ _id: updated.user, role: "client" }, { amount: newAmount, points: newpoints }, { new: true, useFindAndModify: false })
//                 // sendFcmPush(`${vendor?.fcmToken}`, `${updated.phone_number} Transaction Success!`, `${updated.ResultDesc}`);
//                 io?.to(`${vendor._id}`).emit("payment-updated", newAmount)
//                 return
//             }

//         }
//     } catch (error) {
//         console.log(error);
//         res
//             .status(400)
//             .json({ success: false, message: "operation failed ", error });
//         return
//     }
// }
// export const makePayment = async (req: Request | any, res: Response | any) => {
//     try {

//         let io = await getSocketIo()

//         const { amount, phone_number } = req.body;
     
//         // console.log(agent)
//         // res.status(500).json({ message: "Payment not verified. Please try again later." });
//         // return
//         let number
//         if (phone_number) {
//             number = phone_number
//         }
//         else {
//             const user = await User.findById(req.user.userId)
//             number = user?.phone_number
//         }
//         const response = await Mpesa_stk(number, Number(amount), user._id, agent?._id);
//         const merchantRequestId = response.MerchantRequestID;
//         let logs = await MpesaLogs.findOne({ MerchantRequestID: merchantRequestId });
//         io?.to(`${agent._id}`).emit("payment-start", true)
//         const maxRetries = 20;
//         const retryInterval = 5000;
//         let retryCount = 0;
//         while (logs?.log === '' && retryCount < maxRetries) {
//             retryCount++;
//             console.log(`Retrying log fetch: attempt ${retryCount}`);
//             await new Promise(resolve => setTimeout(resolve, retryInterval));
//             logs = await MpesaLogs.findOne({ MerchantRequestID: merchantRequestId });
//         }

//         if (!logs || logs.log === '') {
//             res.status(500).json({ message: "Payment not verified. Please try again later." });
//             io?.to(`${agent._id}`).emit("payment-end", false)
//             return
//         }

//         if (logs.ResponseCode !== 0) {
//             res.status(400).json({ message: logs.ResultDesc });
//             io?.to(`${agent._id}`).emit("payment-end", false)
//             // sendFcmPush(`${agent?.fcmToken}`, `${logs.phone_number} Transaction Status!`, `${logs.ResultDesc}`);
//             return
//         } else {

//             res.status(200).json({ message: "Deposit successful" });
//             let io = getSocketIo()
//             io?.to(`${agent._id}`).emit("payment-end", false)
//             return
//         }

//     } catch (error: any) {
//         console.error("Wallet operation error:", error);
//         return res.status(400).json({
//             success: false,
//             message: "Operation failed",
//             error: error?.message || error
//         });
//     }
// };

// export const get_Mpesa_logs = async (req: Request | any, res: Response | any) => {
//     try {
//         const { page, limit } = req.query;
//         const user: any = await User.findById(req.user.userId)
//         let options = {}
//         if (user.role === "client") {
//             options = { user: req.user.userId }
//         }
//         if (user.role === "admin") {
//             options = { vendor: req.user.userId }
//         }
//         let logs = await MpesaLogs.find(options).skip((page - 1) * limit)
//             .limit(parseInt(limit))
//             .sort({ createdAt: -1 });
//         const total = await MpesaLogs.countDocuments();
//         res.status(200)
//             .json({
//                 logs, page: parseInt(page),
//                 totalPages: Math.ceil(total / limit)
//             });
//         return
//     } catch (error) {
//         console.log(error);
//         res
//             .status(400)
//             .json({ success: false, message: "operation failed ", error });
//         return
//     }
// }
// export const get_wallet_balance = async (req: Request | any, res: Response | any) => {
//     try {
//         let Cash = await User.findOne({ _id: req.user.userId }).select("amount")
//         res.status(200)
//             .json(Cash);
//         return
//     } catch (error) {
//         console.log(error);
//         res
//             .status(400)
//             .json({ success: false, message: "operation failed ", error });
//         return
//     }
// }