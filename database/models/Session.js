module.exports = (Model) => {
    class Session extends Model {
        static get tableName() {
            return 'sessions';
        }

        static get relationMappings() {
            const User = require('./User')(Model);

            return {
                user: {
                    relation: Model.BelongsToOneRelation,
                    modelClass: User,
                    join: {
                        from: `${this.tableName}.userId`,
                        to: `${User.tableName}.id`
                    }
                }
            };
        }
    }

    return Session;
};
