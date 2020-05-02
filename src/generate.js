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

	//		clearing Report table
	const clear_report_result = await database.query('DELETE FROM Report');
	if(!clear_report_result.success)
		console.log('Failed to clear Report table');
	else
		console.log('Cleared Report table');

	//		clearing Status Update table
	const clear_status_update_result = await database.query('DELETE FROM Status_Update');
	if(!clear_status_update_result.success)
		console.log('Failed to clear Status_Update table');
	else
		console.log('Cleared Status_Update table');


	// SECOND, POPULATE EVERYTHING INTO THE DATABASE:
	//		inserting Population data from JSON
	var populations = require('./population-figures-by-country-csv_json.json');
	for(var country of populations)
	{
		if(country.Country == null || country.Year_2016 == null || country.Country_Code == null) continue;

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
		if(disease.id != -1){
			//Insert Hashtag data
			for(var disease_hashtag of disease["hashtags"]){
				hashtag = disease_hashtag["hashtag"];
				const insert_hashtag_result = await database.query('INSERT INTO Hashtag (disease_FK, hashtag) VALUES ('+disease.id+', "'+hashtag+'")');
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
				const insert_rss_result = await database.query('INSERT INTO RSS (disease_FK, title, RSS_url) VALUES ('+disease.id+', "'+rss_title+'", "'+rss+'")');
				if(!insert_rss_result.success)
					console.log('Failed to insert '+rss+' into RSS table');
				else
				{
					console.log('Inserted '+rss+' into RSS table');
				}
			}
		}
	}

	// 		inserting report, then status updates from ourworldindata for COVID-19
	var org_id = -1;
	var disease_id = -1;
	for(var organization of organizations) if(organization.name == 'Our World in Data') org_id = organization.id;
	for(var disease of diseases) if(disease.name == 'COVID-19') disease_id = disease.id;
	if(org_id == -1 || disease_id == -1) throw 'Error in Indexes, wtf?';

	const status_updates = require('./ourworldindata-Covid19.json.json');
	status_updates.sort(function(first, second) {
		if(first.date < second.date)
			return -1;
		else if(first.date > second.date)
			return 1;
		else return 0;
	});

	var current_date = null;
	var report_id = -1;
	for(var status_update of status_updates)
	{
		if(status_update.date != current_date)
		{
			current_date = status_update.date;

			const insert_report_result = await database.query(`INSERT INTO Report (time, report_URL, org_FK) VALUES ('${ status_update.date }', 'google.com', '${ org_id }')`)
			if(!insert_report_result.success)
				console.log(`Failed to insert '${ current_date }' into Report table`);
			else
			{
				report_id = insert_report_result.result.insertId;
				console.log(`Inserted '${ current_date }' into Report table`);
			}
		}

		var population_id = -1;
		for(var population of populations) if(population.Country_Code == status_update.iso_code) population_id = population.id;
		if(population_id == -1 || population_id == null) continue;

		// then proceed to add the status update item
		const status_update_name = `D${ disease_id }:P${ population_id }:R${ report_id }`;
		const insert_status_result = await database.query(`INSERT INTO Status_Update (disease_FK, population_FK, report_FK, total_cases, total_dead, total_recovered) VALUES ('${ disease_id }', '${ population_id }', '${ report_id }', '${ status_update.total_cases}', '${ status_update.total_deaths}', '0')`);
		if(!insert_status_result.success)
			console.log(`Failed to insert ${ status_update_name } into Status Update table`);
		else
			console.log(`Inserted ${ status_update_name } into Status Update table`);
	}



	// THIRD, CLOSE OFF SQL CONNECTION, THEN FINISH
	await database.disconnect();
})();
