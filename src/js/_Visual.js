/**
 * _Visual.js
 */
module.exports = function( main, $, $elms ){
	var _this = this;
	var VisualEditorModeContents = require('./visual/_Contents');
	var VisualEditorModeDeleteRowCols = require('./visual/_DeleteRowCols');
	var currentMode = "contents";

	/**
	 * ツールバーをリセットする
	 */
	this.resetToolbar = function(){
		$elms.toolbarTools.html( main.template('toolbarTools', {
			"mode": "visual",
		}) );
		var $buttons = $elms.toolbarTools.find('.table-tag-editor__tool');

		$elms.toolbarTools.find(`.table-tag-editor__tool--btn-${currentMode}`).addClass('table-tag-editor__tool--on').attr({'disabled': true});

		$elms.toolbarTools.find('.table-tag-editor__tool--btn-contents').on('click.table-tag-editor', function(e){
			$buttons.removeClass('table-tag-editor__tool--on').attr({'disabled': false});
			$(this).addClass('table-tag-editor__tool--on').attr({'disabled': true});
			currentMode = "contents";
			_this.resetUi();
		});

		$elms.toolbarTools.find('.table-tag-editor__tool--btn-delete-row-col').on('click.table-tag-editor', function(e){
			$buttons.removeClass('table-tag-editor__tool--on').attr({'disabled': false});
			$(this).addClass('table-tag-editor__tool--on').attr({'disabled': true});
			currentMode = "delete-row-col";
			_this.resetUi();
		});
	}

	/**
	 * プレビューを更新
	 */
	this.update = function(){
		$elms.previewTable.html( $elms.srcTextarea.val() );
		$elms.previewTable.find('th,td')
			.attr({'contenteditable': true})
			.off('focus.table-tag-editor')
			.off('blur.table-tag-editor')
			.on('focus.table-tag-editor', function(e){
				// console.log('=====', this.innerHTML);
			})
			.on('blur.table-tag-editor', function(e){
				// console.log('-----', this.innerHTML);
			})
			;
	}

	/**
	 * UIをリセットする
	 */
	this.resetUi = function(){
		$elms.visualEditorUi.html('');

		switch( currentMode ){
			case "delete-row-col":
				var visualEditorModeDeleteRowCols = new VisualEditorModeDeleteRowCols(main, $, $elms);
				visualEditorModeDeleteRowCols.init();
				break;
			case "contents":
			default:
				var visualEditorModeContents = new VisualEditorModeContents(main, $, $elms);
				visualEditorModeContents.init();
				break;
		}
	}
}
