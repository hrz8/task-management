const _ = require('lodash');
const joi = require('joi');
const bcrypt = require('bcryptjs');
const MolErr = require('moleculer-web').Errors;

const ms = require('ms');
const jwt = require('jsonwebtoken');

const { Response } = require('../helpers/response');
const CommonMixin = require('../mixins/common.mixin');

const { jwt: jwtConfig } = require('../app.config')[process.env.NODE_ENV || 'development'];

module.exports = {
    name: 'sessions',

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
                                .required(),
                            password: joi.string()
                                .required()
                        })
                        .required(),
                    params: joi.object()
                        .optional()
                }),
            async handler(ctx) {
                const { username, password } = _.get(ctx, 'params.body');
                const user = await ctx.broker.models.User.query().findOne({ username });

                if (_.isEmpty(user)) throw new MolErr.BadRequestError('UNKNOWN_USER');

                if (!bcrypt.compareSync(password, user.password)) {
                    throw new MolErr.BadRequestError('WRONG_PASSWORD');
                }

                const prevSession = await ctx.broker.models.Session.query().findOne({ userId: user.id });

                if (!_.isEmpty(prevSession)) {
                    await prevSession.$query().delete();
                }
                const sessData = this.generateSessionData(user.id, 'user');
                await ctx.broker.models.Session.query().insertAndFetch({
                    userId: user.id,
                    ...sessData
                });

                return new Response({
                    user,
                    ...sessData
                });
            }
        },

        destroy: {
            params: joi.object()
                .keys({
                    query: joi.object()
                        .optional(),
                    body: joi.object()
                        .optional(),
                    params: joi.object()
                        .keys({
                            token: joi.string()
                                .required()
                        })
                        .required()
                }),
            async handler(ctx) {
                const { token } = _.get(ctx, 'params.params');
                const userId = _.get(ctx, 'meta.user.id');

                const sessions = await ctx.broker.models.Session.query().find({ token, userId });
                if (_.isEmpty(sessions)) return new Response({
                    cleared: false
                });

                for (const session of sessions) {
                    await session.$query().delete();
                }

                return new Response({ cleared: true });
            }
        }
    },

    methods: {
        generateSessionData(subject, audience) {
            const expired = new Date(Date.now() + ms(jwtConfig.expiresIn));
            const token = jwt.sign({}, jwtConfig.secret, {
                expiresIn: jwtConfig.expiresIn,
                subject: _.toString(subject),
                audience: _.toString(audience),
                issuer: '2359media'
            });
            return { token, expired };
        }
    }
};
