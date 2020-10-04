const _ = require('lodash');
const moment = require('moment');
const { SuccessResponse } = require('../helpers/response');

module.exports = {
    hooks: {
        before: {
            '*': ctx => {    
                const serviceName = _.get(ctx, 'service.name');
                const actionName = _.get(ctx, 'action.rawName');
                ctx.$responseMessage = ctx.action.responseMessage || `success ${actionName} ${serviceName}`;
                ctx.$statusCode = '200';
            },
        },
        after: {
            '*': (ctx, response) => {
                const serialized = _
                    .chain(response)
                    .get('data')
                    .thru(obj => {
                        if (!_.isObjectLike(obj)) return {};
                        if (_.isEqual(ctx.options.serialize, false)) return obj;
                        const res = _.attempt(ctx.service.getSerializer(ctx), obj);
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

        createDateFilter(params) {
            const tableName = _.get(params, 'tableName');
            let orderDate = _.get(params, 'orderDate', 'day');
            let startDate = _.get(params, 'startDate');
            let endDate = _.get(params, 'endDate');
        
            if (tableName) orderDate = `${tableName}.${orderDate}`;
        
            let operator = '';
            let operand = [];
            let where = '';
            let func = 'where';
        
            if (startDate || endDate) {
                if (startDate) {
                    startDate = moment(startDate)
                        .startOf('day')
                        .toDate();
                    operator = '>=';
                    operand = startDate;
                }
                if (endDate) {
                    endDate = moment(endDate)
                        .endOf('day')
                        .toDate();
                    operator = '<=';
                    operand = endDate;
                }
        
                if (startDate && endDate) {
                    operand = [startDate, endDate];
                }
        
                where = [orderDate, operator, operand];
        
                if (startDate && endDate) {
                    func = 'whereBetween';
                    where.splice(1, 1);
                }
            }
        
            return {
                func,
                args: where
            };
        },

        buildQuery(params, builder) {
            const filterDate = this.createDateFilter(params);
            const { args: filterByDate, func: dateOp } = filterDate;
            if (filterByDate) builder[dateOp](...filterByDate);

            if (params.limit > 0) {
                builder.page(params.page - 1, params.limit);
            } else {
                builder.page();
            }
            return builder;
        },
    }
};
