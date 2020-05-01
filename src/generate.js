const Database = require('./database.js');

// main script, just a linear script to insert everything into the database
(async function main() {
	// INITIALIZE DATABASE CONNECTION
	var database = new Database('driftcar.net', 'cs4347', 'SQueaLers', 'viral_tracker');
	if(!await database.connect())
		throw 'Database Connection Error!';
	else
		console.log('SQL Database Connected!');

	// FIRST, DELETE ALL INFORMATION FROM THE DATABASE:
	// 		clearing Population table
	const clear_population_result = await database.query('DELETE FROM Population');
	if(!clear_population_result.success)
		console.log('Failed to clear Population table');
	else
		console.log('Cleared Population table');

	// 		clearing Organization table
	const clear_organization_result = await database.query('DELETE FROM Organization');
	if(!clear_organization_result.success)
		console.log('Failed to clear Organization table');
	else
		console.log('Cleared Organization table');

	//		clearing Disease table
	const clear_disease_result = await database.query('DELETE FROM Disease');
	if(!clear_disease_result.success)
		console.log('Failed to clear Disease table');
	else
		console.log('Cleared Disease table');

	//		clearing Hashtag table
	const clear_hashtag_result = await database.query('DELETE FROM Hashtag');
	if(!clear_hashtag_result.success)
		console.log('Failed to clear Hashtag table');
	else
		console.log('Cleared Hashtag table');

	// SECOND, POPULATE EVERYTHING INTO THE DATABASE:
	//		inserting Population data from JSON
	var populations = require('./population-figures-by-country-csv_json.json');
	for(var country of populations)
	{
		if(country.Country == null || country.Year_2016 == null) continue;

		const insert_population_result = await database.query(`INSERT INTO Population (name, total, latitude, longitude) VALUES ("${ country.Country }", "${ country.Year_2016}", '0', '0')`);
		if(!insert_population_result.success)
			console.log(`Failed to insert '${ country.Country }' into Population table`);
		else
		{
			country.id = insert_population_result.result.insertId;
			console.log(`Inserted '${ country.Country }' into Population table`);
		}
	}

	//		inserting Organization data from JSON
	var organizations = require('./organizations.json');
	for(var organization of organizations)
	{
		if(organization.name == null || organization.org_URL == null) continue;

		const insert_organization_result = await database.query(`INSERT INTO Organization (name, org_URL) VALUES ("${ organization.name }", "${ organization.org_URL }")`);
		if(!insert_organization_result.success)
			console.log(`Failed to insert '${ organization.name }' into Organization table`);
		else
		{
			organization.id = insert_organization_result.result.insertId;
			console.log(`Inserted '${ organization.name }' into Organization table`);
		}
	}

	//		inserting Disease Data from JSON
	const diseases = require('./diseases.json');
	for(var disease of diseases)
	{
		if(disease.name == null || disease.disease_URL == null) continue;

		const insert_disease_result = await database.query(`INSERT INTO Disease (name, disease_URL) VALUES ("${ disease.name }", "${ disease.disease_URL }")`);
		if(!insert_disease_result.success)
			console.log(`Failed to insert '${ disease.name }' into Disease table`);
		else
		{
			disease.id = insert_disease_result.result.insertId;
			console.log(`Inserted '${ disease.name }' into Disease table`);
		}
	}

	//		inserting Hashtag Data for each Disease
	for(var disease of diseases)
	{

	}

	// THIRD, CLOSE OFF SQL CONNECTION, THEN FINISH
	await database.disconnect();
})();
