'use strict';
const joi = require('joi');

module.exports = {
    name: 'users',
    
    settings: {

    },

    hooks: {
    },

    actions: {
        list: {
            params: joi.object()
                .keys({
                    query: joi.object()
                        .optional(),
                    body: joi.object()
                        .optional(),
                    params: joi.object()
                        .optional()
                }),
            async handler(ctx) {
                const users = await ctx.broker.models.User.query();
                return users;
            }
        },

        get: {
            async handler(ctx) {
                return { kamu: 'kamu' };
            }
        }
    },

    methods: {
    }
};
