const _ = require('lodash');

class Response {
    constructor(data, meta = null) {
        this.data = data;
        this.meta = meta;
    }
}

class SuccessResponse {
    constructor(status, data, message, meta = {}) {
        if (!_.isObjectLike(data)) {
            throw new Error('data must be in array or object');
        }

        if (!_.isString(message)) {
            throw new Error('message must be a string');
        }

        this.status = _.toNumber(status);
        this.data = data;
        this.meta = meta;
        this.message = message;
    }
}

module.exports = {
    Response,
    SuccessResponse
};
