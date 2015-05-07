var casperProcess = (process.platform === "win32" ? "casperjs.cmd" : "casperjs");
var testCountInProcess = 2;
var WRITE_END = "\n"; // importents...
var PREPIX_SET = {
	word : function ( name ) {
		return '['+name+']';
	}
};

// 이 예제는 작동함!!
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

	for ( var i=0 ; i < sectionSetList.length ; i++ ) {
		console.log(process.platform + " <<<<< process.platform");
		var spawn = require("child_process").spawn;
		var child = spawn(casperProcess, ["--ignore-ssl-errors=true", "./test/casper_script.js"]);

		console.log('Spawned child pid: ' + child.pid);


		child.stdin.setEncoding = 'utf-8';
		child.stdin.write(JSON.stringify(sectionSetList[i]) + WRITE_END);
		//child.stdout.pipe(process.stdout);
		child.stdout.on("data", function (data) {
			var strData = String(data);
			console.log('log mag >>>>');
			console.log(strData);
			if ( strData.indexOf(PREPIX_SET.word('save')) == 0 ) {
				saveData( strData.replace( PREPIX_SET.word('save'), '' ) );
			}
		});

		child.stderr.on("data", function (data) {
			console.log("spawnSTDERR:", String(data));
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
		});
	}
}

exports.callCasper = callCasper;

/*
var exec = require("child_process").exec;

exec('casperjs test2.js',function(err,stdout,stderr){
    console.log('stdout: ' + stdout);
});
/*/

function saveData ( data ) {
	console.log('save data--->>>>>>> input');
	console.log(data);

	if ( data ) {
		var dataObj = JSON.parse( data );
		console.log('save log >> ---');
		console.log( dataObj );
	}
}
