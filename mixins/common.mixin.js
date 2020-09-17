const _ = require('lodash');
const { SuccessResponse } = require('../helpers/response');

module.exports = {
    hooks: {
        before: {
            '*': function(ctx) {    
                const serviceName = _.get(ctx, 'service.name');
                const actionName = _.get(ctx, 'action.rawName');
                ctx.$responseMessage = ctx.action.responseMessage || `success ${actionName} ${serviceName}`;
                ctx.$statusCode = '200';
            },
        },
        after: {
            '*': function(ctx, response) {
                const serialized = _
                    .chain(response)
                    .get('data')
                    .thru(obj => {
                        if (!_.isObjectLike(obj)) return {};
                        if (_.isEqual(ctx.options.serialize, false)) return obj;
                        const res = _.attempt(this.getSerializer(ctx), obj);
                        if (_.isError(res)) return obj;
                        return res;
                    })
                    .value();

                const meta = _
                    .chain(response)
                    .get('meta')
                    .thru(obj => (_.isObjectLike(obj) ? {
                        ...obj,
                        count: _.get(obj, 'count') ? parseInt(obj.count, 10) : _.noop(),
                        page: _.get(obj, 'page') ? parseInt(obj.page, 10) : _.noop(),
                        limit: _.get(obj, 'limit') ? parseInt(obj.limit, 10) : _.noop(),
                        pages: _.get(obj, 'count') && _.get(obj, 'limit') 
                            ? Math.ceil(obj.count / obj.limit) : _.noop()
                    } : _.noop()))
                    .value();
    
                return new SuccessResponse(
                    ctx.$statusCode, serialized,
                    ctx.$responseMessage, meta
                );
            }
        }
    },

    methods: {
        getSerializer(ctx) {
            return _.get(this,
                `settings.serializer[${
                    _.get(ctx, 'action.rawName')
                }]`);
        },

        createPagination(params) {
            const page = _.get(params, 'page', 1);
            const limit = _.get(params, 'limit', 25);
            const offset = limit * (page - 1);
        
            return { page, limit, offset };
        },

        buildQuery(params, builder) {
            if (params.limit > 0) {
                builder.page(params.page - 1, params.limit);
            } else {
                builder.page();
            }
            return builder;
        },
    }
};
