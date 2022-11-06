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
		"srcEditor": null,
		"previewTable": null,
	};

	function updatePreview(){
		$elms.previewTable.html( $elms.srcEditor.val() );
	}

	function save(){
		$elms.targetTextarea.val( $elms.srcEditor.val() );
	}

	// Initialize
	new Promise(function(rlv){rlv();})
		.then(function(){ return new Promise(function(rlv, rjt){
			$elms.targetTextarea.before( $elms.main );

			$elms.srcEditor = $elms.main.find('textarea.table-tag-editor__src');
			$elms.previewTable = $elms.main.find('table.table-tag-editor__visual-editor-table');

			$elms.srcEditor.val( $elms.targetTextarea.val() );
			updatePreview();
			rlv();
		}); })
		.then(function(){ return new Promise(function(rlv, rjt){
			var textareaChangedTimer;
			$elms.srcEditor.on('change.table-tag-editor keyup.table-tag-editor', function(){
				clearTimeout( textareaChangedTimer );
				textareaChangedTimer = setTimeout(function(){
					save();
					updatePreview();
				}, 200);
			});
			rlv();
		}); })
	;
}
