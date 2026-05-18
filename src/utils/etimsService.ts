// import axios from "axios";
// import crypto from "crypto";
// import fs from "fs";

// // Load your digital certificate (PEM format)
// const privateKey = fs.readFileSync("./certs/private_key.pem", "utf8");

// // Format invoice payload
// export const buildInvoicePayload = (transaction: any) => {
//     return {
//         invoiceNumber: transaction.invoiceNumber,
//         businessName: transaction.businessName,
//         kraPin: transaction.kraPin,
//         date: new Date().toISOString(),
//         items: transaction.items.map((item: any) => ({
//             description: item.description,
//             quantity: item.quantity,
//             unitPrice: item.unitPrice,
//             taxRate: item.taxRate,
//         })),
//         totalAmount: transaction.totalAmount,
//         taxAmount: transaction.taxAmount,
//     };
// };

// // Sign payload with digital certificate
// export const signPayload = (payload: any) => {
//     const payloadString = JSON.stringify(payload);
//     const signer = crypto.createSign("RSA-SHA256");
//     signer.update(payloadString);
//     signer.end();
//     const signature = signer.sign(privateKey, "base64");
//     return { ...payload, signature };
// };

// // Submit to ETIMS API
// export const submitInvoice = async (payload: any) => {
//     try {
//         const signedPayload = signPayload(payload);
//         const response = await axios.post("https://api.kra.go.ke/etims/invoices", signedPayload, {
//             headers: { "Content-Type": "application/json" },
//         });
//         return response.data;
//     } catch (err: any) {
//         console.error("ETIMS submission failed:", err.response?.data || err.message);
//         throw err;
//     }
// };
