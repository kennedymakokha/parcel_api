// ====================================
// utils/generateParcelCode.ts
// ====================================

import { ParcelCounterModel } from "../models/parcelCounter.model";
import { PickuUpModel } from "../models/pickups.model";


export const generateParcelCode = async (
  pickupId: string
): Promise<string> => {
  const pickup: any = await PickuUpModel.findById(pickupId);

  if (!pickup) {
    throw new Error("Pickup not found");
  }

  /**
   * FORMAT DATE
   * Example: 20260510
   */

  const today = new Date();

  const yyyy = today.getFullYear();

  const mm = String(today.getMonth() + 1).padStart(2, "0");

  const dd = String(today.getDate()).padStart(2, "0");

  const todayString = `${yyyy}${mm}${dd}`;

  /**
   * ATOMIC COUNTER UPDATE
   */

  const counter = await ParcelCounterModel.findOneAndUpdate(
    {
      pickup: pickupId,
      date: todayString,
    },
    {
      $inc: {
        seq: 1,
      },
    },
    {
      new: true,
      upsert: true,
    }
  );

  /**
   * PAD NUMBER
   * Example: 000001
   */

  const sequence = counter.seq
    .toString()
    .padStart(4, "0");

  /**
   * FINAL CODE
   * Example:
   * NRB-20260510-000001
   */

  return `${pickup.short_code}-${todayString}-${sequence}`;
};