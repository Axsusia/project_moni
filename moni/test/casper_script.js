var utils = require('utils');
var system = require('system');
var casper = require("casper").create({
	// pageSettings: {
	// 	loadImages:  false,         
	// 	loadPlugins: false          
	// },
	//logLevel: "debug",             
	verbose: true                   
});

var line = system.stdin.readLine();
var pages = JSON.parse( line );

var TEST_TYPE = {
	move : 0,
	iframe_move : 1,
	screen_shot : 2,
	check : 3,
	form_send : 4
}

casper.on("load.started", function() {
	start = new Date();
});

casper.on("load.finished", function() {
	//console.log('로드 완료');
	this.echo(this.requestUrl + " loaded in " + (new Date() - start) + "ms", "PARAMETER");
});

casper.on('resource.received', function(resource) {
	if(resource.status === 404) {
		//this.echo(resource.url + ' ' + resource.status);
	}
});

casper.on('step.complete', function () {
	//console.log('스탭 종료');
});

casper.start().each( pages, function( self, page, i ) {
	console.log( page.title + '    >> ' + i);

	self.viewport( 1300, 768 );
	self.thenOpen( page.url, function( response ) {
		this.echo('>> ' +page.url + ' try load >> 로드 시젼!!');
		//console.log(JSON.stringify(response));

		// 기본적으로 스샷 한방.
		var fileLocate = 'screenShotTest/'+page.no+'/'+page.no+'.png';
		this.captureSelector(fileLocate, "html");

		var thenList = page.thenList;
		var testResultList = [];

		for ( var j=0 ; j < thenList.length ; j++ ) {
			var test = thenList[j];
			if ( test.type == 1 ) {
				try {
					test_type_1( self, testResultList, test, page );
				} catch(e) {}
			} else if ( test.type == 2 ) {
				try {
					test_type_2( self, testResultList, test, page );
				} catch(e) {}
			}
		}

		testListFinish( casper, testResultList );

	});
	console.log( page.title + '    >> ' + i + '  <<<< end');
});

/**
 * casperjs RUNNING !!
 * @param  {[type]} self) {	this.exit();} [description]
 * @return {[type]}       [description]
 */
casper.run(function(self) {
	this.exit();
});

/**
 * [check_type_1 description]
 * @param  {[type]} casper         [description]
 * @param  {[type]} testResultList [description]
 * @param  {[type]} test           [description]
 * @param  {[type]} page           [description]
 * @return {[type]}                [description]
 */
function test_type_1 ( casper, testResultList, test, page ) {
	casper.then(function(){
		console.log(' >>>>  check_type_1 << start' + page.title);
		//this.wait(1000);
		console.log('test >> in test_type');
		this.capture('screenShotTest/'+page.no+'/'+page.no+'_'+test.no+'.png');
		var resutlVal = this.evaluate(function( test ) {
			return eval( test.seek || '()' );
		}, test);

		this.echo( resutlVal );
		this.echo( resutlVal == test.compare );

		var thenResult = {
			page_no : page.no,
			test_no : test.no,
			result : resutlVal == test.compare
		}

		console.log( JSON.stringify(thenResult) );
		testResultList.push ( thenResult );
	});
}

/**
 * [check_type_2 description]
 * @param  {[type]} casper         [description]
 * @param  {[type]} testResultList [description]
 * @param  {[type]} test           [description]
 * @param  {[type]} page           [description]
 * @return {[type]}                [description]
 */
function test_type_2 ( casper, testResultList, test, page ) {
	casper.then(function( ) {
		casper.page.switchToChildFrame( 10 );
		casper.fill( test.selector, test.form_value, true );
		casper.wait( 2000 );
	});

	casper.thenOpen('http://www.interpark.com', function(){
		casper.echo('폼전송');
	});

	casper.then(function( ) {
		console.log('로그인 후 스샷');
		casper.capture('screenShotTest/'+page.no+'/'+page.no+'__2.png');
	});
}

// test.
function testListFinish ( casper, testResultList ) {
	casper.then(function(){
		console.log("finish");
		msg('save', JSON.stringify(testResultList));
	});
}

function screenShot ( casper, path ) {

}


function msg ( ) {
	//arguments.length
	var argSize = arguments.length;
	//console.log( argSize );
	if ( argSize == 1 ) {
		console.log( arguments[0] );
	} else if ( argSize > 1 ) {
		console.log('[msg]---> save');
		//console.log( arguments[0] + "||" + arguments[1] );
		system.stdout.writeLine( "[" + arguments[0] + "]" + arguments[1]);
	}
}

function getIframeInfo () {

}