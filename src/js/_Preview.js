/**
 * _Preview.js
 */
module.exports = function( main, $, $elms ){
	var _this = this;
	var scanedTable = {};

	/**
	 * ツールバーをリセットする
	 */
	this.resetToolbar = function(){
		$elms.toolbarTools.html( main.template('toolbarTools', {
			"mode": "preview",
		}) );

		$elms.toolbarTools.find('.table-tag-editor__tool--btn-contents').on('click', function(e){
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
				console.log('=====', this.innerHTML);
			})
			.on('blur.table-tag-editor', function(e){
				console.log('-----', this.innerHTML);
			})
			;

		scanTable();
	}


	/**
	 * テーブルの内容をスキャンする
	 */
	function scanTable(){
		scanedTable = {}; // initialize
		scanedTable.thead = [];
		scanedTable.tbody = [];
		scanedTable.tfoot = [];
		scanedTable.isDirectTr = false;
		scanedTable.cols = 0;

		if( $elms.previewTable.find('>tr').length ){
			scanedTable.isDirectTr = true;
		}

		function scanRow( indexRow, $tr ){
			var rtn = [];
			$tr.find('>th,>td').each(function(indexCol, elmCell){
				$elmCell = $(elmCell);
				rtn[indexCol] = {
					"tagName": elmCell.tagName.toLowerCase(),
					"innerHTML": $elmCell.html(),
					"width": $elmCell.width(),
					"height": $elmCell.height(),
					"colspan": Number($elmCell.attr('colspan') || 1),
					"rowspan": Number($elmCell.attr('rowspan') || 1),
				};
			});
			if( scanedTable.cols < rtn.length ){
				scanedTable.cols = rtn.length;
			}
			return rtn;
		}

		$elms.previewTable.find('>thead>tr').each(function(index, elmTr){
			scanedTable.thead.push({
				"cols": scanRow( index, $(elmTr) ),
			});
		});
		$elms.previewTable.find('>tfoot>tr').each(function(index, elmTr){
			scanedTable.tfoot.push({
				"cols": scanRow( index, $(elmTr) ),
			});
		});
		$elms.previewTable.find('>tbody>tr,>tr').each(function(index, elmTr){
			scanedTable.tbody.push({
				"cols": scanRow( index, $(elmTr) ),
			});
		});

		console.log('--- scanedTable:', scanedTable);
		return;
	}

}
