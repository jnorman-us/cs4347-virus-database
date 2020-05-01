const mysql = require('mysql');

module.exports = class Database
{
	constructor(host, user, password, database)
	{
		this.connection = mysql.createConnection({
			host: host,
			user: user,
			password: password,
			database: database,
		});
	}

	connect()
	{
		var self = this;

		return (new Promise(function(resolve) {
			self.connection.connect(function(err) {
				if(err)
				{
					resolve(false);
					throw err;
				}
				else
					resolve(true);
			});
		}));
	}

	query(query)
	{
		var self = this;

		return (new Promise(function(resolve) {
			self.connection.query(query, function(err, result) {
				var returned_result = {
					success: false,
					result: null,
				};
				if(err)
				{
					console.log(err);
					returned_result.result = err;
				}
				else
				{
					returned_result.success = true;
					returned_result.result = result;
				}
				resolve(returned_result);
			});
		}));
	}
}
