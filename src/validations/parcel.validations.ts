import Validator from 'validator';
import { isEmpty } from '../utils/isEmpty';

// sender_name: sender.name,
//       sender_phone,
//       sender_address: sender.address,
//       receiver_name: receiver.name,
//       receiver_phone,
//       receiver_address: receiver.address,
//       weight: parcel.weight,
//       sentFrom: parcel.sentFrom,
//       instructions: parcel.instructions,
//       fragile: parcel.fragile,
//       destination: parcel.destination,
//       pickup: parcel.pickup,
//       price: parcel.price,
//       code: parcel.code,
//       createdBy: req?.user.userId,
//       business: req?.user.business
export const validateParcelInput = (data: any) => {
    let errors: any = {};
    data.sender_name = !isEmpty(data.sender_name) && data.sender_name !== undefined ? data.sender_name : '';
    data.sender_phone = !isEmpty(data.sender_phone) && data.sender_phone !== undefined ? data.sender_phone : '';
    data.receiver_name = !isEmpty(data.receiver_name) && data.receiver_name !== undefined ? data.receiver_name : '';
    data.receiver_phone = !isEmpty(data.receiver_phone) && data.receiver_phone !== undefined ? data.receiver_phone : '';

    data.pickup = !isEmpty(data.pickup) && data.pickup !== undefined ? data.pickup : '';
    if (Validator.isEmpty(data.sender_name)) {
        errors.sender_name = 'Name  field is required';
    }
    if (Validator.isEmpty(data.sender_phone)) {
        errors.sender_phone = 'Sender`s phone number  field is required';
    }
    if (Validator.isEmpty(data.receiver_name)) {
        errors.receiver_name = 'Revievers Name field is required';
    }
    if (Validator.isEmpty(data.receiver_phone)) {
        errors.receiver_phone = 'Revievers Phone number  field is required';
    }
    if (Validator.isEmpty(data.pickup)) {
        errors.pickup = 'Select a destination field is required';
    }
    return {
        errors,
        isValid: isEmpty(errors)
    }
}

