const _ = require('lodash');
const jwt = require('jsonwebtoken');
const moment = require('moment');

const MolErr = require('moleculer-web').Errors;

const { jwt: jwtConfig } = require('../app.config')[process.env.NODE_ENV || 'development'];

module.exports = {
    methods: {
        async authenticate(ctx, route, req) {
            // collecting bearer token jwt
            const token = _
                .chain(req.headers)
                .get('authorization', '')
                .invoke('slice', 7)
                .value();
            if (_.isEmpty(token)) throw new MolErr.UnAuthorizedError('NO_RIGHTS');

            // decode jwt token
            const decoded = jwt.decode(token, jwtConfig.secret);
            const userId = _.toInteger(_.get(decoded, 'sub'));
            if (_.isEmpty(decoded)) throw new MolErr.UnAuthorizedError(MolErr.ERR_INVALID_TOKEN);

            // verifying token with jwt secret
            await this.verifyJWT(token, jwtConfig.secret);

            // fetch session data from db, based on userId and token column
            const sessions = await ctx.broker.models.Session
                .query()
                .where({ token, userId });
            const session = _.head(sessions);
            if (_.isEmpty(session)) throw new MolErr.UnAuthorizedError(MolErr.ERR_INVALID_TOKEN);

            // check the expiration of session data from db
            const expired = _.get(session, 'expired');
            if (moment(expired).isBefore(moment())) throw new MolErr.UnAuthorizedError('ERR_EXPIRED_TOKEN');
            
            // user data will return into ctx.meta.user
            const user = await ctx.broker.models.User
                .query()
                .findById(userId);
            return user;
        },

        async verifyJWT(token, secret) {
            return new Promise((resolve, reject) => {
                jwt.verify(token, secret, (err, decoded) => {
                    if (err) return reject(err);
                    return resolve(decoded);
                });
            });
        },
    },

    created() {
        this.settings.routes = this.settings.routes.map(route => {
            // default value from moleculer 0.14
            return {
                use: [],
                whitelist: ['**'],
                mergeParams: false,
                authentication: true,
                authorization: false,
                callingOptions: {},
                bodyParsers: {
                    json: {
                        strict: false,
                        limit: '1MB'
                    },
                    urlencoded: {
                        extended: true,
                        limit: '1MB'
                    }
                },
                mappingPolicy: 'restrict',
                logging: true,
                ...route
            };
        });
    }
};
