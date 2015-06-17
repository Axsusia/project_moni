var mysql = require('mysql');
var sql = require('./sql.js');
var dbInfo = {
	host     : 'localhost',
	user     : 'root',
	port : 3306,
	password : '1234',
	database : 'test'
};

function DBException ( value, msg ) {
	this.value = value;
	this.message = msg;
	this.toString = function () {
		return this.value + this.message;
	}
}

function getConnection () {
	return mysql.createConnection(dbInfo);
}

function queryFormat (query, values) {
	if (!values) return query;
	return query.replace(/\:(\w+)/gi, function (txt, key) {
		if (values.hasOwnProperty(key)) {
			return values[key];
		}
		return txt;
	}.bind(this));
}

function work ( obj ) {

	if ( ! obj instanceof Object )
		throw new DBException( '[error]', '인자가 오브젝트 형태가 아닙니다.' );
	if ( ! obj.action )
		throw new DBException( '[error]', 'can not find "action" property' );
	if ( ! obj.sqlName )
		throw new DBException( '[error]', 'can not find "sqlName" property' );

	var sqlObj = sql.get( obj.sqlName );
	if ( ! sqlObj )
		throw new DBException( '[error]', 'can not find "sql" in the sql-set.' );

	var connection = mysql.createConnection(dbInfo);
	connection.connect();

	var query = queryFormat( sqlObj.sql, obj.data );
	connection.query( query, function(err, rows, fields) {
		if (err) 
			throw new DBException( '[error]', 'query error.' );
		done ( obj, {rows : rows, fields : fields});
		connection.end();
	});

	function done ( obj, data ) {
		if ( obj.callback || obj.callback instanceof Function )
			obj.callback( data );
	}
}

exports.getConnection = getConnection;
exports.work = work;