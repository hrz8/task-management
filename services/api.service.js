const ApiGateway = require('moleculer-web');
const ApiMixin = require('../mixins/api.mixin');

module.exports = {
    name: 'api-todo',
    mixins: [ApiGateway, ApiMixin],

    settings: {
        port: process.env.PORT || 3000,
        routes: [
            {
                path: '/api',
                authentication: false,
                aliases: {
                    'POST sign-up': 'users.create',
                    'POST login': 'sessions.create',
                    'POST logout': 'sessions.destroy'
                },
            },
            {
                path: '/api/tasks',
                aliases: {
                    'POST ': 'tasks.create',
                    'GET ': 'tasks.list',
                    'GET :id': 'tasks.get'
                },
            },
            {
                path: '/api/users',
                aliases: {
                    'GET ': 'users.list',
                    'GET :id': 'users.get'
                },
            }
        ],

        // Do not log client side errors (does not log an error response when the error.code is 400<=X<500)
        log4XXResponses: false,
        // Logging the request parameters. Set to any log level to enable it. E.g. "info"
        logRequestParams: null,
        // Logging the response data. Set to any log level to enable it. E.g. "info"
        logResponseData: null,
    }
};
