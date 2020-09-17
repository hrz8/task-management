module.exports = (Model) => {
    class TaskList extends Model {
        static get tableName() {
            return 'task_lists';
        }

        static get relationMappings() {
            const Task = require('./Task')(Model);

            return {
                task: {
                    relation: Model.BelongsToOneRelation,
                    modelClass: Task,
                    join: {
                        from: `${this.tableName}.taskId`,
                        to: `${Task.tableName}.id`
                    }
                }
            };
        }
    }

    return TaskList;
};
