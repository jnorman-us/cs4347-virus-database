const Database = require('./database.js');

(async function main() {
	var database = new Database(
		'driftcar.net',
		'cs4347',
		'SQueaLers',
		'viral_tracker',
	);

	if(!await database.connect())
		throw 'Database Connection Error!';
	else
		console.log('SQL Database Connected!');

	// start queries

	// first, delete current information from the database:
	if(!(await database.query('DELETE FROM Population')).success)
		console.log('Failed to clear Population table');
	else
		console.log('Cleared Population table');

	const populations = require('./population-figures-by-country-csv_json.json');

	for(var country of populations)
	{
		if(country.Country == null || country.Year_2016 == null) continue;

		if(!(await database.query(`INSERT INTO Population (name, total, latitude, longitude) VALUES ("${ country.Country }", "${ country.Year_2016}", '0', '0')`)).success)
			console.log(`Failed to insert '${ country.Country }' into Population table`);
		else
			console.log(`Inserted '${ country.Country }' into Population table`);
	}
})();
