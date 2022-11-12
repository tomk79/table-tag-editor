/**
 * _HtmlSrc.js
 */
module.exports = function( main, $, $elms ){

	/**
	 * ツールバーをリセットする
	 */
	this.resetToolbar = function(){
		$elms.toolbarTools.html( main.template('toolbarTools', {
			"mode": "htmlSrc",
		}) );
	}

	/**
	 * プレビューを更新
	 */
	this.update = function(){
		var src = $elms.previewTable.html();
		var $tmpContainer = $('<div>');
		$tmpContainer.html(src);
		$tmpContainer.find('th,td').removeAttr('contenteditable');
		$elms.srcTextarea.val( $tmpContainer.html() );
	}
}
