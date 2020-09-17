const _ = require('lodash');
const BaseValidator = require('moleculer').Validators.Base;
const { ValidationError } = require('moleculer').Errors;

class JoiValidator extends BaseValidator {
    constructor() {
        super();
    }

    compile(schema) {
        return (params) => this.validate(params, schema);
    }

    validate(params, schema) {
        const res = schema.validate(params);
        if (res.error)
            throw new ValidationError(res.error.message, null, res.error.details);
        _.assign(params, res.value);
        return true;
    }
}

module.exports = JoiValidator;
