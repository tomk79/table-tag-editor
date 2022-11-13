/**
 * _TableScanner.js
 */
module.exports = function( main, $ ){
	var _this = this;
	var scanedTable = {};
	var reservedCells = [];

	/**
	 * テーブル行をスキャンする
	 */
	function scanRow( indexRow, $tr ){
		var rtn = [];
		var $cells = $tr.find('>th,>td');
		var totalSpanedRows = 0;

		$cells.each(function(indexCol, elmCell){
			while( reservedCells[indexRow] && reservedCells[indexRow][indexCol+totalSpanedRows] ){
				// colspan, rowspan で予約されていた場合
				rtn[indexCol+totalSpanedRows] = {
					"tagName": null,
					"innerHTML": null,
					"width": null,
					"height": null,
					"colspan": null,
					"rowspan": null,
					"reference": reservedCells[indexRow][indexCol+totalSpanedRows],
				}
				totalSpanedRows ++;
			}

			// セル情報を生成する
			var $elmCell = $(elmCell);
			rtn[indexCol+totalSpanedRows] = {
				"tagName": elmCell.tagName.toLowerCase(),
				"innerHTML": $elmCell.html(),
				"width": $elmCell.width(),
				"height": $elmCell.height(),
				"colspan": Number($elmCell.attr('colspan') || 1),
				"rowspan": Number($elmCell.attr('rowspan') || 1),
			};

			// 連結されたセルを予約する
			for(var iRow = 0; iRow < rtn[indexCol+totalSpanedRows].rowspan; iRow ++){
				reservedCells[indexRow+iRow] = reservedCells[indexRow+iRow] || [];
				for(var iCol = 0; iCol < rtn[indexCol+totalSpanedRows].colspan; iCol ++){
					reservedCells[indexRow+iRow][indexCol+totalSpanedRows+iCol] = reservedCells[indexRow+iRow][indexCol+totalSpanedRows+iCol] || {};
					reservedCells[indexRow+iRow][indexCol+totalSpanedRows+iCol].row = indexRow;
					reservedCells[indexRow+iRow][indexCol+totalSpanedRows+iCol].col = indexCol;
				}
			}
		});


		// TODO: 予約されたセルがさらに右側に広がっているとき、ここで拾う必要がある


		if( scanedTable.cols < rtn.length ){
			scanedTable.cols = rtn.length;
		}
		return rtn;
	}

	/**
	 * テーブルの内容をスキャンする
	 */
	this.scan = function( $table ){

		// initialize
		scanedTable = {};
		scanedTable.thead = [];
		scanedTable.tbody = [];
		scanedTable.tfoot = [];
		scanedTable.isDirectTr = false;
		scanedTable.cols = 0;

		if( $table.find('>tr').length ){
			scanedTable.isDirectTr = true;
		}

		// セクションごとにスキャンする
		var sections = {
			"thead": {
				"query": '>thead>tr',
			},
			"tfoot": {
				"query": '>tfoot>tr',
			},
			"tbody": {
				"query": '>tbody>tr,>tr',
			},
		};
		Object.keys(sections).forEach(function(sectionName){
			reservedCells = [];
			var sectionInfo = sections[sectionName];
			$table.find(sectionInfo.query).each(function(indexRow, elmTr){
				scanedTable[sectionName].push({
					"cols": scanRow( indexRow, $(elmTr) ),
				});
			});
			console.log('--- reservedCells:', sectionName, reservedCells);
		});

		console.log('--- scanedTable:', scanedTable);
		return;
	}

}
