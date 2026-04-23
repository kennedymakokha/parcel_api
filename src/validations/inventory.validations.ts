import Validator from 'validator';
import { isEmpty } from '../utils/isEmpty';
import { Business, Inventory, Product } from '../types';


export const validateInventoryInput = (data: Inventory) => {
    let errors: Inventory | any = {};
    data.product = !isEmpty(data.product) && data.product !== undefined ? data.product : '';
    data.quantity = !isEmpty(data.quantity) && data.quantity !== undefined ? data.quantity : 0;
    if (Validator.isEmpty(data.product)) {
        errors.product = 'Select a product';
    }
    if (Validator.isEmpty(data.quantity)) {
        errors.quantity = 'quantity  field is required';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}

