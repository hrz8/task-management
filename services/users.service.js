const _ = require('lodash');
const joi = require('joi');
const bcrypt = require('bcryptjs');
const MolErr = require('moleculer-web').Errors;

const { Response } = require('../helpers/response');

const CommonMixin = require('../mixins/common.mixin');

module.exports = {
    name: 'users',

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
                            username: joi.string()
                                .min(6)
                                .required(),
                            fullName: joi.string()
                                .min(3)
                                .required(),
                            password: joi.string()
                                .min(8)
                                .required()
                        })
                        .optional(),
                    params: joi.object()
                        .optional()
                }),
            async handler(ctx) {
                const payload = _.get(ctx, 'params.body');

                const exist = await ctx.broker.models.User
                    .query()
                    .findOne({ 
                        username: payload.username
                    });
                if (!_.isEmpty(exist)) throw new MolErr.BadRequestError('USERNAME_ALREADY_EXIST');

                _.set(payload, 'password', bcrypt.hashSync(payload.password, 8));
                const user = await ctx.broker.models.User.query().insertAndFetch(payload);
                _.unset(user, 'password');
                return new Response(user);
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
                                .default(25)
                        })
                        .optional(),
                    body: joi.object()
                        .optional(),
                    params: joi.object()
                        .optional()
                }),
            async handler(ctx) {
                const { page, limit } = _.get(ctx, 'params.query');
                const users = await ctx.broker.models.User
                    .query()
                    .modify(builder => {
                        ctx.service.buildQuery({ page, limit }, builder);
                        builder.select(
                            'users.id as id',
                            'users.username as username',
                            'users.fullName as fullName',
                        );
                    });
                
                return new Response(
                    users.results, { 
                        count: users.total, 
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
                const user = await ctx.broker.models.User
                    .query()
                    .findById(id);
                _.unset(user, 'password');
                return new Response(user);
            }
        },

        remove: {
            params: joi.object()
                .keys({
                    query: joi.object()
                        .optional(),
                    body: joi.object()
                        .optional(),
                    params: joi.object()
                        .keys({
                            username: joi.string()
                                .required()
                        })
                        .required()
                }),
            async handler(ctx) {
                const { username } = _.get(ctx, 'params.params');

                await ctx.broker.models.User
                    .query()
                    .where({ username })
                    .del();

                return new Response({ cleared: true });
            }
        }
    },

    methods: {
    }
};
