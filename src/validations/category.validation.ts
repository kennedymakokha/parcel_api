import Validator from 'validator';
import { isEmpty } from '../utils/isEmpty';
import { Category } from '../types';


export const validateCategoryInput = (data: Category) => {
    let errors: Category | any = {};
    data.category_name = !isEmpty(data.category_name) && data.category_name !== undefined ? data.category_name : '';
    data.description = !isEmpty(data.description) && data.description !== undefined ? data.description : '';
    if (Validator.isEmpty(data.category_name)) {
        errors.category_name = 'Name  field is required';
    }
    if (Validator.isEmpty(data.description)) {
        errors.description = 'Name  field is required';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}

