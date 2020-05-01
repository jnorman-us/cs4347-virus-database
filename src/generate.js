const Database = require('./database.js');

// main script, just a linear script to insert everything into the database
(async function main() {
	// INITIALIZE DATABASE CONNECTION
	var database = new Database('driftcar.net', 'cs4347', 'SQueaLers', 'viral_tracker');
	if(!await database.connect())
		throw 'Database Connection Error!';
	else
		console.log('SQL Database Connected!');

	// start queries

	// FIRST, DELETE ALL INFORMATION FROM THE DATABASE:
	// 		clearing Population table
	if(!(await database.query('DELETE FROM Population')).success)
		console.log('Failed to clear Population table');
	else
		console.log('Cleared Population table');

	// 		clearing Organization table
	if(!(await database.query('DELETE FROM Organization')).success)
		console.log('Failed to clear Organization table');
	else
		console.log('Cleared Organization table');

	// SECOND, POPULATE EVERYTHING INTO THE DATABASE:
	//		inserting Population data from JSON
	const populations = require('./population-figures-by-country-csv_json.json');
	for(var country of populations)
	{
		if(country.Country == null || country.Year_2016 == null) continue;

		if(!(await database.query(`INSERT INTO Population (name, total, latitude, longitude) VALUES ("${ country.Country }", "${ country.Year_2016}", '0', '0')`)).success)
			console.log(`Failed to insert '${ country.Country }' into Population table`);
		else
			console.log(`Inserted '${ country.Country }' into Population table`);
	}

	//		inserting Organization data from JSON
	const organizations = require('./organizations.json');
	for(var organization of organizations)
	{
		if(organization.name == null || organization.org_URL == null) continue;

		if(!(await database.query(`INSERT INTO Organization (name, org_URL) VALUES ("${ organization.name }", "${ organization.org_URL }")`)))
			console.log(`Failed to insert '${ organization.name }' into Organization table`);
		else
			console.log(`Inserted '${ organization.name }' into Organization table`);
	}
})();
