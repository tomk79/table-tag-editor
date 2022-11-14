/**
 * main.js
 */
module.exports = function( elm, options ){
	var $ = require('jquery');
	var main = this;
	var templates = {
		"mainframe": require('../resources/templates/mainframe.twig'),
		"toolbarTools": require('../resources/templates/toolbarTools.twig'),
	};
	var $elms = {
		"main": $(templates.mainframe()),
		"targetTextarea": $(elm),
		"toolbar": null,
		"toolbarTools": null,
		"visualEditor": null,
		"previewTable": null,
		"htmlSrcEditor": null,
		"srcTextarea": null,
	};
	var visual = new(require('./_Visual'))(main, $, $elms);
	var htmlSrc = new(require('./_HtmlSrc'))(main, $, $elms);

	options = options || {};
	options.lang = options.lang || 'en';

	/**
	 * 編集内容を保存する
	 */
	this.save = function(){
		if( $elms.visualEditor.is(':visible') ){
			htmlSrc.update();
			visual.resetUi();
		}else{
			visual.update();
		}
		$elms.targetTextarea.val( $elms.srcTextarea.val() );
	}

	/**
	 * テンプレートを取得する
	 */
	this.template = function(templateId, data){
		data = data || {};
		data.main = main;
		return templates[templateId](data);
	}

	/**
	 * オプションの値を取得する
	 */
	this.options = function(key){
		return options[key];
	}

	// --------------------------------------
	// Initialize
	new Promise(function(rlv){rlv();})
		.then(function(){ return new Promise(function(rlv, rjt){
			$elms.targetTextarea.before( $elms.main );

			$elms.toolbar = $elms.main.find('.table-tag-editor__toolbar');
			$elms.toolbarTools = $elms.main.find('.table-tag-editor__toolbar-tools');
			$elms.visualEditor = $elms.main.find('.table-tag-editor__visual-editor');
			$elms.previewTable = $elms.main.find('table.table-tag-editor__visual-editor-table');
			$elms.visualEditorUi = $elms.main.find('.table-tag-editor__visual-editor-ui');
			$elms.htmlSrcEditor = $elms.main.find('.table-tag-editor__src-editor');
			$elms.srcTextarea = $elms.main.find('textarea.table-tag-editor__src');

			$elms.srcTextarea.val( $elms.targetTextarea.val() );
			visual.update();
			rlv();
		}); })
		.then(function(){ return new Promise(function(rlv, rjt){
			var textareaChangedTimer;
			$elms.srcTextarea.on('change.table-tag-editor keyup.table-tag-editor', function(){
				clearTimeout( textareaChangedTimer );
				textareaChangedTimer = setTimeout(function(){
					if( $elms.htmlSrcEditor.is(':visible') ){
						main.save();
					}
				}, 200);
			});

			// DOMの変更を監視する
			var observer = new MutationObserver(function(records){
				if( $elms.visualEditor.is(':visible') ){
					main.save();
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

			// プレビューモードからスタート
			$elms.htmlSrcEditor.hide();
			visual.resetToolbar();
			visual.resetUi();

			// 編集モードの切り替え
			$elms.toolbar.find('.table-tag-editor__btn-toggle-editor-mode').on('click.table-tag-editor', function(){
				main.save();
				if( $elms.visualEditor.is(':visible') ){
					$elms.visualEditor.hide();
					$elms.htmlSrcEditor.show();
					htmlSrc.resetToolbar();
				}else{
					$elms.htmlSrcEditor.hide();
					$elms.visualEditor.show();
					visual.resetToolbar();
				}
			});
			rlv();
		}); })
	;
}
