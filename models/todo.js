module.exports= function (sequelize, Datatypes) {
	return sequelize.define('todo',{
		description:{
			type: Datatypes.STRING,
			allowNull:false,
			validate:{
				len:[1,250]
			}
		},
		completed:{
			type: Datatypes.BOOLEAN,
			allowNull:false,
			defaultValue:false,
			validate: {
				isBoolean: function (value) {
					if (typeof value !== 'boolean') {
						throw new Error('Completed must be a boolean');
					}
				}
			}
		}
	});
};