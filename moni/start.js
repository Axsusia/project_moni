require('../common/prototype.js');
var CronJob = require('cron').CronJob;

var nodeScript = require('./test/node_script');
var fs = require('fs');

function loadList ( callCasper ) {
	var dataList ;
	fs.readFile('../test_data/data.json', 'utf8', function (err, data) {
		if (err) throw err;
		dataList = JSON.parse(data);
		//console.log(dataList);
		//console.log(dataList.length);
		//console.log('test');
		try {
			callCasper(dataList);
		} catch( e ) {
			console.log( '실행 중 에러... 강제 종료' );
		}
	});
}

console.log( 'start.js' );
new CronJob('00 */5 * * * *', function() {
	loadList( nodeScript.callCasper );	
}, null, true, 'America/Los_Angeles');