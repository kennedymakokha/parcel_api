import Validator from 'validator';
import { isEmpty } from '../utils/isEmpty';
import { Business } from '../types';


export const validateTruckInput = (data: any) => {
    let errors:  any = {};
    data.plate = !isEmpty(data.plate) && data.plate !== undefined ? data.plate : '';
    data.model = !isEmpty(data.model) && data.model !== undefined ? data.model : '';
    data.capacity = !isEmpty(data.capacity) && data.capacity !== undefined ? data.capacity : '';
    data.driver = !isEmpty(data.driver) && data.driver !== undefined ? data.driver : '';
    if (Validator.isEmpty(data.plate)) {
        errors.plate = 'Plate  field is required';
    }
    if (Validator.isEmpty(data.driver)) {
        errors.driver = 'Select a  Driver ';
    }
    if (Validator.isEmpty(data.capacity)) {
        errors.capacity = 'Capacity  field is required';
    }

    if (Validator.isEmpty(data.model)) {
        errors.model = 'model field is required';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}
