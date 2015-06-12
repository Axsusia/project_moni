/* DB setting */
var DB = require('../../common/db/connection.js');

/* casperJs setting */
var casperProcess = (process.platform === "win32" ? "casperjs.cmd" : "casperjs");
var testCountInProcess = 2;

/* add more option */
var WRITE_END = "\n"; // importents...
var PREPIX_SET = {
	word : function ( name ) {
		return '['+name+']';
	}
};

function callCasper( pages ) {

	var sectionSetList = (function(pages){

		var tmpList = [];
		var setCount = Math.ceil( pages.length / testCountInProcess );

		for ( var i=0 ; i<setCount ; i++ ) {
			var startNum = (testCountInProcess*i+1)-1;
			var lastNum = ((i+1)*testCountInProcess);
			//console.log( startNum + ' / ' + lastNum );
			tmpList.push( pages.slice( startNum, lastNum ) );
		}

		return tmpList;
	})( pages );
	var childDataSet = {};

	for ( var i=0 ; i < sectionSetList.length ; i++ ) {

		console.log(process.platform + " <<<<< process.platform");
		var spawn = require("child_process").spawn;
		var child = spawn(casperProcess, ["--ignore-ssl-errors=true", "./test/casper_script.js"]);
		var key = 'childNo_' + i;
		childDataSet[key] = [];

		console.log('Spawned child pid: ' + child.pid);

		child.stdin.setEncoding = 'utf-8';
		child.stdin.write(JSON.stringify(sectionSetList[i]) + WRITE_END);
		
		//child.stdout.pipe(process.stdout);
		(function(child, key, childDataSet){
			child.stdout.on("data", function (data) {
				var strData = data.toString();
				childDataSet[key].push ( strData );
			});
			child.on("close", function(){
				dataOrganization ( childDataSet[key] );
			});
		})(child, key, childDataSet);

		child.stderr.on("data", function (data) {
			console.log("spawnSTDERR:", data.toString());
		});

		child.stdout.on('end', function(){
			console.log("[end] ", "child process pipe end.................pipe.....");
		});

		// child 호출이 끝난 후에. child process 와는 별개임
		child.on("exit", function (code) {
			console.log('child process exit <<< ');
			//console.log("spawnEXIT:", code);
			//process.kill(-child.pid);
			//child.kill();
			//
		});
	}
}

exports.callCasper = callCasper;

function dataOrganization ( lineAry ) {
	console.dir(lineAry.length + "  <<  size check......." );

	for ( var i=0 ; i<lineAry.length ; i++ ) {
		if ( lineAry[i] && lineAry[i].indexOf(PREPIX_SET.word('save')) == 0 ) {
			console.log('**저장시작**');
			console.log(lineAry[i]);
			
			var dataObj = JSON.parse( lineAry[i].replace( PREPIX_SET.word('save'), '' ) );
			pageLogSave ( dataObj );
		}
	}
	console.log('dataOrganization--->>>>>>> 종료');
}

var LOG_TIME = ( function () {
	var recodeDate = new Date();
	return recodeDate.format('yyyyMMddHHmm');
})();

function pageLogSave ( dbObj ) {
	dbObj.log_time = LOG_TIME;
	DB.work({
		action : 'insert',
		sqlName : 'insertLogData',
		data : dbObj,
		callback : function ( data ) {
			console.log( 'save success' );
			console.log( data );
		}
	});
}