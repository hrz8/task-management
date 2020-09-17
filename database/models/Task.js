module.exports = (Model) => {
    class Task extends Model {
        static get tableName() {
            return 'tasks';
        }

        static get relationMappings() {
            const User = require('./User')(Model);
            const TaskList = require('./TaskList')(Model);

            return {
                user: {
                    relation: Model.BelongsToOneRelation,
                    modelClass: User,
                    join: {
                        from: `${this.tableName}.userId`,
                        to: `${User.tableName}.id`
                    }
                },

                lists: {
                    relation: Model.HasManyRelation,
                    modelClass: User,
                    join: {
                        from: `${this.tableName}.id`,
                        to: `${TaskList.tableName}.taskId`
                    }
                }
            };
        }
    }

    return Task;
};
