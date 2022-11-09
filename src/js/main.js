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
		"toolbar": null,
		"visualEditor": null,
		"previewTable": null,
		"htmlSrcEditor": null,
		"srcTextarea": null,
	};

	function updatePreview(){
		$elms.previewTable.html( $elms.srcTextarea.val() );
	}

	function save(){
		$elms.targetTextarea.val( $elms.srcTextarea.val() );
	}

	// Initialize
	new Promise(function(rlv){rlv();})
		.then(function(){ return new Promise(function(rlv, rjt){
			$elms.targetTextarea.before( $elms.main );

			$elms.toolbar = $elms.main.find('.table-tag-editor__toolbar');
			$elms.visualEditor = $elms.main.find('.table-tag-editor__visual-editor');
			$elms.previewTable = $elms.main.find('table.table-tag-editor__visual-editor-table');
			$elms.htmlSrcEditor = $elms.main.find('.table-tag-editor__src-editor');
			$elms.srcTextarea = $elms.main.find('textarea.table-tag-editor__src');

			$elms.srcTextarea.val( $elms.targetTextarea.val() );
			updatePreview();
			rlv();
		}); })
		.then(function(){ return new Promise(function(rlv, rjt){
			var textareaChangedTimer;
			$elms.srcTextarea.on('change.table-tag-editor keyup.table-tag-editor', function(){
				clearTimeout( textareaChangedTimer );
				textareaChangedTimer = setTimeout(function(){
					save();
					updatePreview();
				}, 200);
			});
			rlv();
		}); })
		.then(function(){ return new Promise(function(rlv, rjt){
			$elms.htmlSrcEditor.hide();
			$elms.toolbar.find('.table-tag-editor__btn-toggle-editor-mode').on('click.table-tag-editor', function(){
				if( $elms.visualEditor.is(':visible') ){
					$elms.visualEditor.hide();
					$elms.htmlSrcEditor.show();
				}else{
					$elms.htmlSrcEditor.hide();
					$elms.visualEditor.show();
				}
			});
			rlv();
		}); })
	;
}
