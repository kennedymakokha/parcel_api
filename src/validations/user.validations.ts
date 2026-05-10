import Validator from 'validator';
import { isEmpty } from '../utils/isEmpty';


export const validateUserInput = (data: any) => {
    let errors: any = {};
    data.name = !isEmpty(data.name) && data.name !== undefined ? data.name : '';
    data.phone_number = !isEmpty(data.phone_number) && data.phone_number !== undefined ? data.phone_number : '';
    data.identification_No = !isEmpty(data.identification_No) && data.identification_No !== undefined ? data.identification_No : '';
    data.pickup = !isEmpty(data.pickup) && data.pickup !== undefined ? data.pickup : '';
    if (Validator.isEmpty(data.name)) {
        errors.name = 'Name  field is required';
    }

    if (Validator.isEmpty(data.phone_number)) {
        errors.phone_number = 'phone number  field is required';
    }
    if (Validator.isEmpty(data.pickup)) {
        errors.identification_No = 'ID No  field is required';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}

