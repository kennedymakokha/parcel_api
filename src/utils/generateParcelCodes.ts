import { parcelDriverModel } from "../models/parcelDriverModel";
import { PickuUpModel } from "../models/pickups.model";

export const generateParcelCode = async (pickupId: string) => {
  const pickup :any= await PickuUpModel.findById(pickupId);

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const count = await parcelDriverModel.countDocuments({
    pickup,
    createdAt: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  });

  const sequence = (count + 1)
    .toString()
    .padStart(6, '0');

  return `${pickup.short_code}-${sequence}`;
};