/* *********************************************************************
	casperjs 에서는 모듈 형태로 js 파일을 부를 수 있는 기능이 없음으로,
	주석을 단락 삼아 한 파일에 모든 펑션을 선언한다.
	보통은 테스트당 js 하나를 만들어 주는게 정석인듯.

	varsion : 0.1
	made : seosiwon
********************************************************************* */

// ####################################
// CASTERJS FUNCTION
// ####################################

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
	move : 1,
	iframe_move : 2,
	screen_shot : 3,
	check : 4,
	form_send : 5
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
		this.echo('******************************************');
		this.echo('>> ' +page.title + ' try load >> 로드 시젼!!');
		this.echo('******************************************');
		//console.log(JSON.stringify(response));

		// 기본적으로 스샷 한방.
		if ( page.screen_shot == 'Y' ) {
			var fileLocate = 'screenShotTest/'+page.no+'/'+page.no+'.png';
			this.captureSelector(fileLocate, "html");
		}

		var test_list = page.test_list;
		var testResultList = [];

		for ( var j=0 ; j < test_list.length ; j++ ) {
			try {
				var test = test_list[j];
				if ( test.type == TEST_TYPE.move )
					test_move ( self, testResultList, test, page );
				else if ( test.type == TEST_TYPE.iframe_move )
					test_iframe_move ( self, testResultList, test, page );
				else if ( test.type == TEST_TYPE.screen_shot )
					test_screen_shot ( self, testResultList, test, page );
				else if ( test.type == TEST_TYPE.check )
					test_check ( self, testResultList, test, page );
				else if ( test.type == TEST_TYPE.form_send )
					test_form_send ( self, testResultList, test, page );
			} catch(e) {
				console.log(e);
			}
		}

		testListFinish( casper, testResultList );
	});
	//console.log( page.title + '    >> ' + i + '  <<<< end');
});

/**
 * casperjs RUNNING !!
 * @param  {[type]} self) {	this.exit();} [description]
 * @return {[type]}       [description]
 */
casper.run(function(self) {
	this.exit();
});

// ####################################
// TEST FUNCTION
// ####################################

function test_move ( casper, testResultList, test, page ) {
	casper.then(function(){
		if ( test.url ) {
			casper.thenOpen( test.url, function() { 
				// 성공
			});
		} else {
			// 실패
		}
	});
}

function test_iframe_move ( casper, testResultList, test, page ) {
	casper.then(function () {
		if  ( test.iframe_name ) {
			var iframeIndex = this.evaluate(function( iframeName ) {
				try {
					__name_index__ = '';
					$('iframe').each(function( index ) {
						var name = $(this).attr('name');
						if ( name == iframeName )
							__name_index__ = index;
					});
					return __name_index__;
				} catch (e) {
					return '';
				}
			}, test.iframe_name);
			if ( iframeIndex > -1 ) {
				casper.page.switchToChildFrame( iframeIndex );
			}
		} else {
			//fail
		}
	});
}

function test_screen_shot ( casper, testResultList, test, page ) {
	casper.then(function() {
		var fileLocate = 'screenShotTest/'+page.no+'/'+test.no+'.png';
		this.captureSelector(fileLocate, "html");
	});
}

function test_check ( casper, testResultList, test, page ) {
	casper.then(function() {
		var resutlVal = this.evaluate(function( test ) {
			return eval( test.seek || '();' );
		}, test);
		console.log( page.title + "에 대한 " + test.no + "번째 테스트 >> [" + resutlVal + "]" );
	});
}

function test_form_send ( casper, testResultList, test, page ) {
	casper.then(function() {
		var exist = this.evaluate(function( formName ) {
			try {
				__name_form__ = false;
				var forms = document.forms;
				for ( var i=0 ; i<forms.length ; i++ ) {
					if ( forms[i].name == formName )
						__name_form__ = true;
					else 
						__name_form__ = false;
				}
				return __name_form__;
			} catch (e) {
				return false;
			}
		}, test.form_name);
		console.log('>>>>>> form_name >>>> ' + exist + ' <<<<<<<<<< exist');
		if ( exist ) {
			var formFinder = "form[name="+ test.form_name +"]";
			this.echo( formFinder );
			casper.fill( formFinder, test.form_value, true );
			casper.wait( 2000 );
		} else {
			// fail
		}
	});
}

function testListFinish ( casper, testResultList ) {
	casper.then(function(){
		//console.log("finish");
		msg('save', JSON.stringify(testResultList));
	});
}

// ####################################
// MSAGE FUNCTION
// ####################################

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

// ####################################
// UTILS FUNCTION
// ####################################

