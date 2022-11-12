/**
 * _TableScanner.js
 */
module.exports = function( main, $ ){
	var _this = this;
	var scanedTable = {};

	/**
	 * テーブルの内容をスキャンする
	 */
    this.scan = function( $table ){
		scanedTable = {}; // initialize
		scanedTable.thead = [];
		scanedTable.tbody = [];
		scanedTable.tfoot = [];
		scanedTable.isDirectTr = false;
		scanedTable.cols = 0;

		if( $table.find('>tr').length ){
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

		$table.find('>thead>tr').each(function(index, elmTr){
			scanedTable.thead.push({
				"cols": scanRow( index, $(elmTr) ),
			});
		});
		$table.find('>tfoot>tr').each(function(index, elmTr){
			scanedTable.tfoot.push({
				"cols": scanRow( index, $(elmTr) ),
			});
		});
		$table.find('>tbody>tr,>tr').each(function(index, elmTr){
			scanedTable.tbody.push({
				"cols": scanRow( index, $(elmTr) ),
			});
		});

		console.log('--- scanedTable:', scanedTable);
		return;
	}

}
