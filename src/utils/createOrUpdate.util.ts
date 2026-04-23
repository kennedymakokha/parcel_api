// import Wallet from "../models/wallet.model";

//  const createOrUpdateWallet = async ({
//     userId,
//     amount,
//     contributionId,
//     isSubtract = false
// }: {
//     userId: string,
//     amount: number,
//     contributionId: string,
//     isSubtract?: boolean
// }) => {
//     const wallet = await Wallet.findOne({ user_id: userId });
//     const amountNum = Number(amount);

//     if (wallet) {
//         const updatedAmount = isSubtract
//             ? Number(wallet.total_amount) - amountNum
//             : Number(wallet.total_amount) + amountNum;

//         const updatedWallet = await Wallet.findOneAndUpdate(
//             { user_id: userId },
//             { total_amount: updatedAmount },
//             { new: true }
//         );
//         return updatedWallet;
//     } else {
//         const newWallet = await new Wallet({
//             user_id: userId,
//             total_amount: amountNum,
//             contibution_id: contributionId
//         }).save();
//         return newWallet;
//     }
// };
// export default createOrUpdateWallet