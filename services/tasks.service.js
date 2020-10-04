const _ = require('lodash');
const Joi = require('joi');
const JoiDate = require('@hapi/joi-date');
const joi = Joi.extend(JoiDate);
const moment = require('moment');
const MolErr = require('moleculer-web').Errors;

const { Response } = require('../helpers/response');

const CommonMixin = require('../mixins/common.mixin');

module.exports = {
    name: 'tasks',

    mixins: [CommonMixin],
    
    settings: {},

    actions: {
        create: {
            params: joi.object()
                .keys({
                    query: joi.object()
                        .optional(),
                    body: joi.object()
                        .keys({
                            day: joi.date()
                                .format('DD/MM/YYYY')
                                .optional(),
                            location: joi.string()
                                .min(3)
                                .optional(),
                            startAt: joi.date()
                                .format('DD/MM/YYYY hh:mm')
                                .when('endAt', { 
                                    is: joi.exist(),
                                    then: joi.required(),
                                    otherwise: joi.optional() 
                                }),
                            endAt: joi.date()
                                .format('DD/MM/YYYY hh:mm')
                                .optional(),
                            lists: joi.array()
                                .items(joi.object()
                                    .keys({
                                        description: joi.string()
                                            .min(3)
                                            .optional(),
                                        startAt: joi.date()
                                            .format('DD/MM/YYYY hh:mm')
                                            .when('endAt', { 
                                                is: joi.exist(),
                                                then: joi.required(),
                                                otherwise: joi.optional() 
                                            }),
                                        endAt: joi.date()
                                            .format('DD/MM/YYYY hh:mm')
                                            .optional(),
                                    }))
                                .min(1),
                            raw: joi.array()
                                .items(joi.string()
                                    .min(3)
                                )
                                .min(1)
                        })
                        .xor('lists', 'raw')
                        .xor('day', 'raw')
                        .xor('raw', 'startAt'),
                    params: joi.object()
                        .optional()
                }),
            async handler(ctx) {
                const user = _.get(ctx, 'meta.user');
                const payload = _.get(ctx, 'params.body');

                _.set(payload, 'userId', user.id);

                const day = _.get(payload, 'day', moment(new Date())
                    .startOf('day')
                    .toDate());
                _.set(payload, 'day', day);

                await this.createValidation(ctx, payload, day);

                // handle payload when raw key payload is not empty
                const raw = _.get(payload, 'raw');
                if (!_.isEmpty(raw)) {
                    _.unset(payload, 'raw');
                    let lists = [];

                    let initDay = true;
                    let dt = day;
                    _.forEach(raw, str => {
                        // prep payload[]
                        const pl = {};
                        _.set(pl, 'description', str);

                        // collecting date from string
                        const { 
                            dateRaw,
                            altDateRaw,
                            dayValue,
                            monthValue
                        } = this.collectDate(str);

                        // collecting hour from string
                        const {
                            hourRaw,hourValue
                        } = this.collectHour(str);

                        // handling date regex result
                        if (!_.isNull(dateRaw) || !_.isNull(altDateRaw)) {

                            // make sure that will not something like this: 
                            // "train biceps for the guns at 19 jun 9pm tomorrow"
                            if (!_.isNull(dateRaw) 
                                && !_.isNull(altDateRaw)) throw new MolErr
                                .BadRequestError('AMBIGOUS_DATE_INPUT');

                            if (!_.isNull(dateRaw)) {
                                const monthStr = String(monthValue).padStart(2, '0');
                                const dayStr = String(dayValue).padStart(2, '0');
                                dt = moment(`${moment().year()}-${monthStr}-${dayStr}`)
                                    .startOf('day')
                                    .toDate();
                            }

                            if (!_.isNull(altDateRaw)) {
                                let inc = altDateRaw === 'tomorrow'? 1 : 0;
                                const todayNameDay = moment(day)
                                    .format('dddd')
                                    .toLocaleLowerCase();
                                if (altDateRaw !== 'today' && altDateRaw !== 'tomorrow') {
                                    const tdyI = moment.weekdays()
                                        .indexOf(
                                            todayNameDay.charAt(0).toUpperCase() + todayNameDay.slice(1)
                                        );
                                    const harI = moment.weekdays()
                                        .indexOf(
                                            altDateRaw.charAt(0).toUpperCase() + altDateRaw.slice(1)
                                        );
                                    inc = harI - tdyI < 0 ? harI - tdyI + 7 : harI - tdyI;
                                }
                                dt = moment(day)
                                    .add(inc, 'day')
                                    .startOf('day')
                                    .toDate();
                                _.set(pl, 'startAt', dt);
                            }

                            // replace day payload if not yes replaced
                            if (initDay) {
                                _.set(payload, 'day', dt);
                                initDay = false;
                            } else if (!moment(dt).isSame(moment(_.get(payload, 'day')))) {
                                throw new MolErr
                                    .BadRequestError('DIFFERENT_DATE_IN_SAME_TASK');
                            }
                        }

                        // handling hour regex result
                        if (!_.isNull(hourRaw)) {
                            const hourStr = String(hourValue).padStart(2, '0');
                            dt = moment(
                                `${moment(dt).format('YYYY-MM-DD')} ${hourStr}`
                            ).toDate();
                            _.set(pl, 'startAt', dt);
                            initDay = false;
                        }

                        lists.push(pl);
                    });
                    _.set(payload, 'lists', lists);
                }

                const trx = await ctx.broker.models.transaction.start();
                const task = await ctx.broker.models.Task
                    .query(trx)
                    .skipUndefined()
                    .insertGraph(payload, {
                        relate: true
                    });
                await trx.commit();

                return new Response(task);
            }
        },

        list: {
            params: joi.object()
                .keys({
                    query: joi.object()
                        .keys({
                            page: joi.number()
                                .positive()
                                .optional()
                                .default(1),
                            limit: joi.number()
                                .positive()
                                .optional()
                                .default(25),
                            startDate: joi.date()
                                .optional(),
                            endDate: joi.date()
                                .optional(),
                            location: joi.string()
                                .optional()
                        })
                        .optional(),
                    body: joi.object()
                        .optional(),
                    params: joi.object()
                        .optional()
                }),
            async handler(ctx) {
                const user = _.get(ctx, 'meta.user');
                const { 
                    page,
                    limit,
                    startDate,
                    endDate
                } = _.get(ctx, 'params.query');
                const location = _.get(ctx, 'params.query', '');

                const { tableName } = ctx.broker.models.Task;
                const tasks = await ctx.broker.models.Task
                    .query()
                    .eager('lists')
                    .where({ userId: user.id })
                    .modify(builder => {
                        ctx.service.buildQuery({
                            tableName,
                            startDate,
                            endDate,
                            page,
                            limit
                        }, builder);

                        builder
                            .where('location', 'like', `%${location}%`);
                    });
                return new Response(
                    tasks.results, { 
                        count: tasks.total, 
                        page, 
                        limit 
                    }
                );
            }
        },

        get: {
            params: joi.object()
                .keys({
                    query: joi.object()
                        .optional(),
                    body: joi.object()
                        .optional(),
                    params: joi.object()
                        .keys({
                            id: joi.number()
                                .positive()
                                .required()
                        })
                        .optional()
                }),
            async handler(ctx) {
                const id = _.get(ctx, 'params.params.id');
                const task = await ctx.broker.models.Task
                    .query()
                    .eager('lists')
                    .findById(id);
                return new Response(task);
            }
        }
    },

    methods: {
        async createValidation(ctx, payload, day) {
            const user = _.get(ctx, 'meta.user');
            const { startAt, endAt, lists } = payload;

            // check if startAt is on the same day as 'day'
            if (!_.isUndefined(startAt)
                && !_.isEqual(
                    moment(startAt).format('YYYY-MM-DD'),
                    moment(day).format('YYYY-MM-DD'))
            ) throw new MolErr.BadRequestError('OFFSET_TIME');

            // check if endAt is on the same day as 'day'
            if (!_.isUndefined(endAt)
                && !_.isEqual(
                    moment(endAt).format('YYYY-MM-DD'),
                    moment(day).format('YYYY-MM-DD'))
            ) throw new MolErr.BadRequestError('OFFSET_TIME');

            // check if endAt is greater datetime than startAt
            if (!_.isUndefined(startAt)
                && !_.isUndefined(endAt)
                && moment(endAt).isAfter(moment(startAt))
            ) throw new MolErr.BadRequestError('OFFSET_TIME');

            // check if there is another task when startAt is defined
            if (!_.isUndefined(startAt)) {
                const tasks = await ctx.broker.models.Task
                    .query()
                    .eager('lists')
                    .where({
                        userId: user.id,
                        day
                    });
                if (!_.isEmpty(tasks)) {
                    _.forEach(tasks, task => {
                        const taskStartAt = _.get(task, 'startAt');
                        const taskEndAt = _.get(task, 'endAt');
                        // if the previous data startAt is same with new startAt
                        if (!_.isUndefined(taskStartAt)
                            && moment(taskStartAt).isSame(moment(startAt))
                        ) throw new MolErr.BadRequestError('CONFLICT_TIME');
                        // if the previous data endAt is greater datetime with new startAt
                        if (!_.isUndefined(taskEndAt)
                            && moment(taskEndAt).isAfter(moment(startAt))
                        ) throw new MolErr.BadRequestError('CONFLICT_TIME');
                    });
                }
            }

            _.forEach(lists, list => {
                const listStartAt = _.get(list, 'startAt');
                const listEndAt = _.get(list, 'endAt');
                // iif list startAt is before task startAt
                if (!_.isUndefined(listStartAt)
                    && !_.isUndefined(startAt)
                    && moment(listStartAt).isBefore(moment(startAt))
                ) throw new MolErr.BadRequestError('OFFSET_TIME_LIST');
                // iif list endAt is after task endAt
                if (!_.isUndefined(listEndAt) 
                    && !_.isUndefined(endAt)
                    && moment(listEndAt).isAfter(moment(endAt))
                ) throw new MolErr.BadRequestError('OFFSET_TIME_LIST');
            });
        },

        collectDate(str) {
            const dateRgx = new RegExp('(?<tgl>(\\d{1,2}) (jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec))', 'i');
            const altDateRgx = new RegExp('(?<har>(tomorrow|today|sunday|monday|tuesday|wednesday|thursday|friday|saturday))', 'i');

            const dateRes = dateRgx.exec(str);
            const dateRaw = _.get(dateRes, 'groups.tgl', null);
            const dayValue = dateRaw ? parseInt(dateRes[2]) : null;
            const monthValue = dateRaw ? parseInt(
                moment.monthsShort().indexOf(
                    dateRes[3].charAt(0).toUpperCase() + dateRes[3].slice(1)
                ) + 1) : null;
            const altDateRes = altDateRgx.exec(str);
            const altDateRaw = _.get(altDateRes, 'groups.har', null);

            return { 
                dateRaw,
                altDateRaw,
                dayValue,
                monthValue
            };
        },

        collectHour(str) {
            const hourRgx = new RegExp('(?<jam>(\\d{1,2})(pm|am))', 'i');

            const hourRes = hourRgx.exec(str);
            let hourRaw = _.get(hourRes, 'groups.jam', null);
            if (_.endsWith(hourRaw, ' ')) hourRaw.slice(0, -1);
            let hourValue = hourRaw ? parseInt(hourRes[2]) : null;
            const hourSuffix = hourRaw ? hourRes[3] : null;
            if (hourSuffix === 'pm') hourValue += 12;

            return {
                hourRaw,
                hourValue
            };
        }
    }
};
