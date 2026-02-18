/**
 * _Visual.js
 */
module.exports = function( main, $, $elms ){
	var _this = this;
	var VisualEditorModeAddRowCols = require('./visual/_AddRowCols');
	var VisualEditorModeDeleteRowCols = require('./visual/_DeleteRowCols');
	var VisualEditorModeMergeCells = require('./visual/_MergeCells');
	var currentMode = "add-row-col";

	/**
	 * ツールバーをリセットする
	 */
	this.resetToolbar = function(){
		$elms.toolbarTools.html( main.template('toolbarTools', {
			"mode": "visual",
		}) );
		var $buttons = $elms.toolbarTools.find('.table-tag-editor__tool');

		$elms.toolbarTools.find(`.table-tag-editor__tool--btn-${currentMode}`).addClass('table-tag-editor__tool--on').attr({'disabled': true});

		$elms.toolbarTools.find('.table-tag-editor__tool--btn-add-row-col').on('click.table-tag-editor', function(e){
			$buttons.removeClass('table-tag-editor__tool--on').attr({'disabled': false});
			$(this).addClass('table-tag-editor__tool--on').attr({'disabled': true});
			currentMode = "add-row-col";
			_this.resetUi();
		});

		$elms.toolbarTools.find('.table-tag-editor__tool--btn-delete-row-col').on('click.table-tag-editor', function(e){
			$buttons.removeClass('table-tag-editor__tool--on').attr({'disabled': false});
			$(this).addClass('table-tag-editor__tool--on').attr({'disabled': true});
			currentMode = "delete-row-col";
			_this.resetUi();
		});

		$elms.toolbarTools.find('.table-tag-editor__tool--btn-merge-cells').on('click.table-tag-editor', function(e){
			$buttons.removeClass('table-tag-editor__tool--on').attr({'disabled': false});
			$(this).addClass('table-tag-editor__tool--on').attr({'disabled': true});
			currentMode = "merge-cells";
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
			case "merge-cells":
				var visualEditorModeMergeCells = new VisualEditorModeMergeCells(main, $, $elms);
				visualEditorModeMergeCells.init();
				break;
			case "add-row-col":
			default:
				var visualEditorModeAddRowCols = new VisualEditorModeAddRowCols(main, $, $elms);
				visualEditorModeAddRowCols.init();
				break;
		}
	}
}
