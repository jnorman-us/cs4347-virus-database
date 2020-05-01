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

	//		inserting Hashtag and RSS Data for each Disease
	for(var disease of diseases)
	{
		//Get disease ID for the foreign key; will return -1 if the disease is not found in the Disease table
		disease_id = -1;
		id_number_result = await database.query('SELECT `disease_id` FROM Disease WHERE `name` = "'+disease["name"]+'"');
		result_data = id_number_result["result"];
		if (result_data.length > 0){
			disease_id = result_data[0]["disease_id"];
		}
		
		if(disease_id != -1){
			//Insert Hashtag data
			for(var disease_hashtag of disease["hashtags"]){
				hashtag = disease_hashtag["hashtag"];
				const insert_hashtag_result = await database.query('INSERT INTO Hashtag (disease_FK, hashtag) VALUES ('+disease_id+', "'+hashtag+'")');
				if(!insert_hashtag_result.success)
					console.log('Failed to insert '+hashtag+' into Hashtag table');
				else
				{
					console.log('Inserted '+hashtag+' into Hashtag table');
				}
			}
			//Insert RSS data
			for(var disease_RSS of disease["RSS"]){
				rss = disease_RSS["RSS"];
				rss_title = disease["name"] + " RSS";
				const insert_rss_result = await database.query('INSERT INTO RSS (disease_FK, title, RSS_url) VALUES ('+disease_id+', "'+rss_title+'", "'+rss+'")');
				if(!insert_rss_result.success)
					console.log('Failed to insert '+rss+' into RSS table');
				else
				{
					console.log('Inserted '+rss+' into RSS table');
				}
			}
		}
	}

	// THIRD, CLOSE OFF SQL CONNECTION, THEN FINISH
	await database.disconnect();
})();
