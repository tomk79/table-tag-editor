/**
 * main.js
 */
module.exports = function( elm ){
	var $ = require('jquery');
	var main = this;
	var templates = {
		"mainframe": require('../resources/templates/mainframe.twig')
	};
	var $elms = {
		"main": $(templates.mainframe()),
		"targetTextarea": $(elm),
	};


	// Initialize
	new Promise(function(rlv){rlv();})
		.then(function(){ return new Promise(function(rlv, rjt){
			$elms.targetTextarea.before( $elms.main );
			rlv();
		}); })
	;
}
