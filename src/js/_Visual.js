/**
 * _Visual.js
 */
module.exports = function( main, $, $elms ){
	var _this = this;
	var VisualEditorModeContents = require('./visual/_Contents');

	/**
	 * ツールバーをリセットする
	 */
	this.resetToolbar = function(){
		$elms.toolbarTools.html( main.template('toolbarTools', {
			"mode": "visual",
		}) );

		$elms.toolbarTools.find('.table-tag-editor__tool--btn-contents').on('click.table-tag-editor', function(e){
			// TODO: 編集モードを変更する
			console.log('contents');
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
		var visualEditorModeContents = new VisualEditorModeContents(main, $, $elms);
		visualEditorModeContents.init();
	}
}
