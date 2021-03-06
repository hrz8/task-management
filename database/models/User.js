module.exports = (Model) => {
    class User extends Model {
        static get tableName() {
            return 'users';
        }

        static get relationMappings() {
            const Task = require('./Task')(Model);

            return {
                tasks: {
                    relation: Model.HasManyRelation,
                    modelClass: Task,
                    join: {
                        from: `${this.tableName}.id`,
                        to: `${Task.tableName}.userId`
                    }
                },
            };
        }
    }

    return User;
};
