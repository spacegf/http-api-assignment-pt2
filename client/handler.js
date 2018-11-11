const http = require('http');
document.getElementById('api-form').addEventListener('submit', apiGet);

function apiGet(event) {
	event.preventDefault();
	

	const options = {
		hostname: 'localhost',
		port: 3000,
		path: document.getElementById('page').value,
		method: 'POST',
		headers: { 'Content-Type': document.getElementById('type').value }
	};

	console.log(options);

	http.request(options, (res) => {
		console.log(`STATUS: ${res.statusCode}`);
		console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
	});

};