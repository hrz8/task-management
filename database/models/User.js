module.exports = (Model) => {
    class User extends Model {
        static get tableName() {
            return 'users';
        }
    }

    return User;
};
