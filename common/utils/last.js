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

exports.Last = Last;