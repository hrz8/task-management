module.exports = (Model) => {
    class Session extends Model {
        static get tableName() {
            return 'sessions';
        }
    }

    return Session;
};
