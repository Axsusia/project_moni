/* *********************************************************************
	casperjs 에서는 모듈 형태로 js 파일을 부를 수 있는 기능이 없음으로,
	주석을 단락 삼아 한 파일에 모든 펑션을 선언한다.
	보통은 테스트당 js 하나를 만들어 주는게 정석인듯.

	varsion : 0.1
	auter : seosiwon
********************************************************************* */

// ####################################
// SETTING FUNCTION
// ####################################

/* DB 저장 객체 */
function DB_Object ( pageNo, testNo, testTp, code, msg ) {
	this.page_no = pageNo;
	this.test_no = testNo;
	this.test_tp = testTp;
	this.code = code;
	this.msg = msg;
}
DB_Object.prototype.setPageNo = function ( pageNo ) {
	this.page_no = pageNo;
}
DB_Object.prototype.setTestNo = function ( testNo ) {
	this.test_no = testNo;
}
DB_Object.prototype.setTestTp = function ( testTp ) {
	this.test_tp = testTp;
}
DB_Object.prototype.setCode = function ( code ) {	
	this.code = code;
}
DB_Object.prototype.setMsg = function ( msg ) {
	this.msg = msg;
}

// ####################################
// SETTING VAR
// ####################################

var TEST_TYPE = {
	move : 1,
	iframe_move : 2,
	screen_shot : 3,
	check : 4,
	form_send : 5
}

var SETTING = {
	capturePath : ''
}

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

	self.viewport( 1300, 768 );
	self.thenOpen( page.url, function( response ) {
		this.echo(
				'******************************************\n'
			+	'>> ' +page.title + ' try load >> 로드 시젼!!\n'
			+	'******************************************'
		);

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
		//testFinish( casper, testResultList );
	});
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
				var dbObj = new DB_Object( page.no, test.no, test.type, '200', '페이지 이동 성공' );
				testFinish ( casper, dbObj );
			});
		} else {
			// 실패
			var dbObj = new DB_Object( page.no, test.no, test.type, '400', '페이지 이동 실패' );
			testFinish ( casper, dbObj );
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
				var dbObj = new DB_Object( page.no, test.no, test.type, '200', '아이프레임 이동 성공' );
				testFinish ( casper, dbObj );
			}
		} else {
			var dbObj = new DB_Object( page.no, test.no, test.type, '400', '해당 아이프레임 없음' );
			testFinish ( casper, dbObj );
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
			return eval( test.seek || ';' );
		}, test);
		console.log( page.title + "에 대한 " + test.no + "번째 테스트 >> [" + resutlVal + "]" );
		if ( resutlVal ) {
			var dbObj = new DB_Object( page.no, test.no, test.type, '200', '테스트 성공' );
			testFinish ( casper, dbObj );
		} else {
			var dbObj = new DB_Object( page.no, test.no, test.type, '400', '테스트 실패' );
			testFinish ( casper, dbObj );
		}
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
		//console.log('>>>>>> form_name >>>> ' + exist + ' <<<<<<<<<< exist');
		if ( exist ) {
			var formFinder = "form[name="+ test.form_name +"]";
			this.echo( formFinder );
			casper.fill( formFinder, test.form_value, true );
			casper.wait( 2000 );
			var dbObj = new DB_Object( page.no, test.no, test.type, '200', '폼전송 성공' );
			testFinish ( casper, dbObj );
		} else {
			// fail
			var dbObj = new DB_Object( page.no, test.no, test.type, '400', '폼전송 실패' );
			testFinish ( casper, dbObj );
		}
	});
}

// 추가예정
function test_javascript ( casper,testResultList, test, page ) {
	 casper.then(function() {

	 });
}

function testFinish ( casper, testResultList ) {
	casper.then(function(){
		msg('save', JSON.stringify(testResultList));
	});
}

function testListFinish () {
	casper.then(function(){
		msg('save_last', JSON.stringify(testResultList));
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
		//console.log( arguments[0] );
	} else if ( argSize > 1 ) {
		//console.log('[msg] ::: save'+"\n");
		//console.log( arguments[0] + "||" + arguments[1] );
		system.stdout.writeLine( "[" + arguments[0] + "]" + arguments[1] + "\n");
	}
}

// ####################################
// UTILS FUNCTION
// ####################################