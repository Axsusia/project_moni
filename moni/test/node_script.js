/* DB setting */
var DB = require('../../common/db/connection.js');

/* casperJs setting */
var casperProcess = (process.platform === "win32" ? "casperjs.cmd" : "casperjs");
var testCountInProcess = 2;
var setCount;

/* add more option */
var WRITE_END = "\n"; // importents...
var PREPIX_SET = {
	word : function ( name ) {
		return '['+name+']';
	}
};

function callCasper( pages ) {

	setCount = Math.ceil( pages.length / testCountInProcess );
	var sectionSetList = (function(pages, setCount){
		var tmpList = [];
		for ( var i=0 ; i<setCount ; i++ ) {
			var startNum = (testCountInProcess*i+1)-1;
			var lastNum = ((i+1)*testCountInProcess);
			//console.log( startNum + ' / ' + lastNum );
			tmpList.push( pages.slice( startNum, lastNum ) );
		}
		return tmpList;
	})( pages, setCount );

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
				console.log(strData);
				childDataSet[key].push ( strData );
			});
			child.on("close", function(){
				dataOrganization ( childDataSet[key], key );
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
			//child.kill();
		});
	}

	var LOG_TIME = ( function () {
		var recodeDate = new Date();
		return recodeDate.format('yyyyMMddHHmm');
	})();

	DB.work({
		action : 'insert',
		sqlName : 'insertLogTime',
		data : {log_time : LOG_TIME},
		callback : function ( data ) {
			console.log( LOG_TIME + ' >>>> 마지막 시간 저장 완료' );
		}
	});
	
	function pageLogSave ( ary , lastDone ) {
		for ( var i=0 ; i<ary.length ; i++ ) {
			var dbObj = ary[i];
			dbObj.log_time = LOG_TIME;
			DB.work({
				action : 'insert',
				sqlName : 'insertLogData',
				data : dbObj,
				callback : function ( data ) {
					console.log( 'save success' );
					lastDone.trigger();
				}
			});
		}
	}

	var lastDoneSet = {};
	function dataOrganization ( lineAry, key ) {

		var saveObjAry = [];
		for ( var i=0 ; i<lineAry.length ; i++ ) {
			if ( lineAry[i] && lineAry[i].indexOf(PREPIX_SET.word('save')) == 0 ) {
				var dataObj = JSON.parse( lineAry[i].replace( PREPIX_SET.word('save'), '' ) );
				saveObjAry.push( dataObj );
			}
		}
		
		if ( ! lastDoneSet[ key ] )
			lastDoneSet[ key ] = new Last( 0, saveObjAry.length, processFinish );

		pageLogSave ( saveObjAry , lastDoneSet[ key ]);
		console.log('dataOrganization--->>>>>>> 종료');
	}

	var lastAction = new Last( 0, setCount, function(){
		console.log('모두 종료되쑴!');
		DB.work({
			action : 'insert',
			sqlName : 'insertLogSummary',
			callback : function ( data ) {
				console.log('요약 저장 완료;');
			} 
		});
	});

	function processFinish () {
		console.log('프로세스 종료...');
		lastAction.trigger();
	}
}

exports.callCasper = callCasper;

function Last ( initCnt, compareCnt, callback, callbackParam ) {
	this.count = initCnt || 0;
	this.compareCount = compareCnt || null;
	this.callback = callback;
	this.callbackParam = callbackParam;
}
Last.prototype.setCount = function ( count ) {
	this.count = count;
}
Last.prototype.setCompareCount = function ( compareCount ) {
	this.compareCount = compareCount;
}
Last.prototype.setCallback = function ( callback ) {
	this.callback = callback;
}
Last.prototype.setCallbackParam = function ( callbackParam ) {
	this.callbackParam = callbackParam;
}
Last.prototype.trigger = function ( ) {
	++this.count;
	console.log( this.count + ' / ' + this.compareCount );
	if ( this.count == this.compareCount ) {
		this.action();
	}
}
Last.prototype.action = function ( ) {
	if ( this.callback && this.callback instanceof Function ) {
		this.callback( this.callbackParam || null );
	}
}