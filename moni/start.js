var nodeScript = require('./test/node_script');
var fs = require('fs');

function loadList ( callCasper ) {
	var dataList ;

	fs.readFile('../test_data/data.json', 'utf8', function (err, data) {
		if (err) throw err;
		dataList = JSON.parse(data);
		console.log(dataList);
		//console.log(dataList.length);
		//console.log('test');

		callCasper(dataList);
	});
}
console.log( 'start.js' );

loadList( nodeScript.callCasper );
