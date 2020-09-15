const ApiGateway = require('moleculer-web');

module.exports = {
    methods: {
        async authenticate(ctx, route, req) {
            // Read the token from header
            const auth = req.headers['authorization'];

            if (auth && auth.startsWith('Bearer')) {
                const token = auth.slice(7);

                // Check the token. Tip: call a service which verify the token. E.g. `accounts.resolveToken`
                if (token == '123456') {
                    // Returns the resolved user. It will be set to the `ctx.meta.user`
                    return { id: 1, name: 'John Doe' };

                } else {
                    // Invalid token
                    throw new ApiGateway.Errors.UnAuthorizedError(ApiGateway.Errors.ERR_INVALID_TOKEN);
                }

            } else {
                // No token. Throw an error or do nothing if anonymous access is allowed.
                // throw new E.UnAuthorizedError(E.ERR_NO_TOKEN);
                return null;
            }
        },

        async authorize(ctx, route, req) {
            // Get the authenticated user.
            const user = ctx.meta.user;

            // It check the `auth` property in action schema.
            if (req.$action.auth == 'required' && !user) {
                throw new ApiGateway.Errors.UnAuthorizedError('NO_RIGHTS');
            }
        }

    },

    created() {
        this.settings.routes = this.settings.routes.map(route => {
            // default value from moleculer 0.14
            return {
                use: [],
                mergeParams: false,
                authentication: false,
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
