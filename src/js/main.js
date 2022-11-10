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
		$elms.previewTable.find('th,td').attr({'contenteditable': true});
	}

	function updateHtmlSrc(){
		var src = $elms.previewTable.html();
		var $tmpContainer = $('<div>');
		$tmpContainer.html(src);
		$tmpContainer.find('th,td').removeAttr('contenteditable');
		$elms.srcTextarea.val( $tmpContainer.html() );
	}

	function save(){
		if( $elms.visualEditor.is(':visible') ){
			updateHtmlSrc();
		}else{
			updatePreview();
		}
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
					if( $elms.htmlSrcEditor.is(':visible') ){
						save();
					}
				}, 200);
			});

			// DOMの変更を監視する
			var observer = new MutationObserver(function(records){
				if( $elms.visualEditor.is(':visible') ){
					save();
				}
			})
			observer.observe($elms.previewTable.get(0), {
				"attributes": false, // 属性変化の監視
				"attributeOldValue": false, // 変化前の属性値を matation.oldValue に格納する
				"characterData": true, // テキストノードの変化を監視
				"characterDataOldValue": true, // 変化前のテキストを matation.oldValue に格納する
				"childList": true, // 子ノードの変化を監視
				"subtree": true, // 子孫ノードも監視対象に含める
			});

			rlv();
		}); })
		.then(function(){ return new Promise(function(rlv, rjt){
			$elms.htmlSrcEditor.hide();
			$elms.toolbar.find('.table-tag-editor__btn-toggle-editor-mode').on('click.table-tag-editor', function(){
				save();
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
