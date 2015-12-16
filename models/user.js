var bcrypt = require('bcryptjs');
var _ = require('underscore');
module.exports = function (sequelize, Datatypes) {
    var user = sequelize.define('user', {
        email: {
            type: Datatypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        salt: {
            type: Datatypes.STRING
        },
        password_hash: {
            type: Datatypes.STRING
        },
        password: {
            type: Datatypes.VIRTUAL,
            allowNull: false,
            validate: {
                len: [7, 100]
            },
            set: function (value) {
                var salt = bcrypt.genSaltSync(10);
                var hashedPassword = bcrypt.hashSync(value, salt);
                this.setDataValue('password', value);
                this.setDataValue('salt', salt);
                this.setDataValue('password_hash', hashedPassword);
            }
        }
    }, {
        hooks: {
            beforeValidate: function (user, options) {
                if (typeof user.email === 'string') {
                    user.email = user.email.toLowerCase();
                }
            }
        },
        classMethods: {
            authenticate: function (body) {
                return new Promise(function (resolve, reject) {
                    if (!_.isString(body.email) || body.email.trim().length === 0 || !_.isString(body.password) || body.password.trim().length === 0) {
                        return reject();
                    }
                    body.email = body.email.trim();
                    body.password = body.password.trim();
                    user.findOne({
                        where: {
                            email: body.email
                        }
                    }).then(function (user) {
                        if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) {
                            return reject();
                        }
                        resolve(user);
                    }, function (error) {
                        return reject();
                    });
                });
            }
        },
        instanceMethods: {
            toPublicJSON: function () {
                var json = this.toJSON();
                return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');
            }
        }
    });

	return user;
};