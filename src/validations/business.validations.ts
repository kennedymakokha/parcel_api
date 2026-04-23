import Validator from 'validator';
import { isEmpty } from '../utils/isEmpty';
import { Business } from '../types';


export const validateBusinessInput = (data: Business) => {
    let errors: Business | any = {};
    data.business_name = !isEmpty(data.business_name) && data.business_name !== undefined ? data.business_name : '';
    data.phone_number = !isEmpty(data.phone_number) && data.phone_number !== undefined ? data.phone_number : '';
    data.postal_address = !isEmpty(data.postal_address) && data.postal_address !== undefined ? data.postal_address : '';
    data.kra_pin = !isEmpty(data.kra_pin) && data.kra_pin !== undefined ? data.kra_pin : '';
    data.api_key = !isEmpty(data.api_key) && data.api_key !== undefined ? data.api_key : '';
    data.master_ke = !isEmpty(data.master_ke) && data.master_ke !== undefined ? data.master_ke : '';
    data.contact_number = !isEmpty(data.contact_number) && data.contact_number !== undefined ? data.contact_number : '';
    data.description = !isEmpty(data.description) && data.description !== undefined ? data.description : '';
    if (Validator.isEmpty(data.business_name)) {
        errors.business_name = 'Name  field is required';
    }
    if (Validator.isEmpty(data.kra_pin)) {
        errors.kra_pin = 'KRA Pin  field is required';
    }
    if (Validator.isEmpty(data.phone_number)) {
        errors.phone_number = 'phone number  field is required';
    }

    if (Validator.isEmpty(data.contact_number)) {
        errors.contact_number = 'contact number  field is required';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}

export const validatePickupInput = (data: Business | any) => {
    let errors: Business | any = {};
    data.pickup_name = !isEmpty(data.pickup_name) && data.pickup_name !== undefined ? data.pickup_name : '';
    data.phone_number = !isEmpty(data.phone_number) && data.phone_number !== undefined ? data.phone_number : '';
    data.contact_number = !isEmpty(data.contact_number) && data.contact_number !== undefined ? data.contact_number : '';
    data.description = !isEmpty(data.description) && data.description !== undefined ? data.description : '';
    if (Validator.isEmpty(data.pickup_name)) {
        errors.pickup_name = 'Name  field is required';
    }

    if (Validator.isEmpty(data.phone_number)) {
        errors.phone_number = 'phone number  field is required';
    }

    if (Validator.isEmpty(data.contact_number)) {
        errors.contact_number = 'contact number  field is required';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}

