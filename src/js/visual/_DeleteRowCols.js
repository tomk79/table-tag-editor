/**
 * visual/_contents.js
 */
module.exports = function( main, $, $elms ){
	var _this = this;
	var scanedTable = {};
	var TableScanner = require('./../_TableScanner');
	var rowQueryList = [
		{"section": "thead", "query": '>thead>tr',},
		{"section": "tfoot", "query": '>tfoot>tr',},
		{"section": "tbody", "query": '>tbody>tr,>tr',},
	];

	/**
	 * UIをリセットする
	 */
	this.init = function(){
		var offset = $elms.previewTable.offset();
		var tableScanner = new TableScanner( main, $ );
		scanedTable = tableScanner.scan($elms.previewTable);

		// --------------------------------------
		// 行削除ボタンを配置
		rowQueryList.forEach(function(rowQueryInfo, rowQueryIndex){
			$elms.previewTable.find(rowQueryInfo.query)
				.each(function(index, trElm){
					var $trElm = $(trElm);
					var $btnAddAfter = $('<div class="table-tag-editor__ui-btn table-tag-editor__ui-btn--delete table-tag-editor__ui-btn--row"><button type="button">-</button></div>');
					$elms.visualEditorUi.append($btnAddAfter);
					$btnAddAfter
						.css({
							"position": "absolute",
							"left": 10,
							"top": $trElm.offset().top - offset.top + 40,
							"height": $trElm.height(),
						})
					;
					$btnAddAfter.find('button')
						.attr({
							"data-table-section": rowQueryInfo.section,
							"data-row-number": index,
						})
						.on('click.table-tag-editor', function(e){
							// --------------------------------------
							// 行を削除する
							var $this = $(this);
							var targetRowNumber = Number($this.attr('data-row-number'));
							var targetTableSection = $this.attr('data-table-section');
							var rowspanIncrementedMemo = {};
							var $trs = $elms.previewTable.find(rowQueryInfo.query);
							// 削除する行の下の行で、削除行にまたがる rowspan の解決（下の行の参照を減らす）
							for(var i = 0; i < scanedTable[targetTableSection][targetRowNumber].cols.length; i ++){
								if( scanedTable[targetTableSection][targetRowNumber+1] && scanedTable[targetTableSection][targetRowNumber+1].cols[i] && scanedTable[targetTableSection][targetRowNumber+1].cols[i].reference ){
									var tmpReference = scanedTable[targetTableSection][targetRowNumber+1].cols[i].reference;
									if( targetRowNumber < tmpReference.row ){
										continue;
									}
									var $tmpCell = $trs.eq(tmpReference.domRow).find('>th, >td').eq(tmpReference.domCol);
									var tmpRowspan = Number($tmpCell.attr('rowspan'));
									if( rowspanIncrementedMemo[tmpReference.domRow+":"+tmpReference.domCol] ){
										continue;
									}
									if( !tmpRowspan ){ tmpRowspan = 1; }
									if( tmpRowspan >= 2 ){
										rowspanIncrementedMemo[tmpReference.domRow+":"+tmpReference.domCol] = true;
										tmpRowspan --;
										if( tmpRowspan >= 2 ){
											$tmpCell.attr({'rowspan': tmpRowspan});
										}else{
											$tmpCell.removeAttr('rowspan');
										}
									}
								}
							}
							// 削除する行自体が上からの rowspan の参照になっている場合の解決
							for(var i = 0; i < scanedTable[targetTableSection][targetRowNumber].cols.length; i ++){
								var cellInfo = scanedTable[targetTableSection][targetRowNumber].cols[i];
								if( cellInfo && cellInfo.reference && cellInfo.reference.row < targetRowNumber ){
									var tmpReference = cellInfo.reference;
									var $tmpCell = $trs.eq(tmpReference.domRow).find('>th, >td').eq(tmpReference.domCol);
									var tmpRowspan = Number($tmpCell.attr('rowspan'));
									if( rowspanIncrementedMemo[tmpReference.domRow+":"+tmpReference.domCol] ){
										continue;
									}
									if( !tmpRowspan ){ tmpRowspan = 1; }
									if( tmpRowspan >= 2 ){
										rowspanIncrementedMemo[tmpReference.domRow+":"+tmpReference.domCol] = true;
										tmpRowspan --;
										if( tmpRowspan >= 2 ){
											$tmpCell.attr({'rowspan': tmpRowspan});
										}else{
											$tmpCell.removeAttr('rowspan');
										}
									}
								}
							}
							$elms.previewTable.find(rowQueryInfo.query).eq(targetRowNumber).remove();
							main.save();
						});
				})
				;
		});

		// --------------------------------------
		// 列削除ボタンを配置
		if( scanedTable.tbody.length ){
			for( var col = 0; scanedTable.tbody[0].cols.length > col; col ++ ){			
				for( var row = 0; scanedTable.tbody.length > row; row ++ ){
					if( !scanedTable.tbody[row].cols[col].offset ){
						continue;
					}

					var $btnAddAfter = $('<div class="table-tag-editor__ui-btn table-tag-editor__ui-btn--delete table-tag-editor__ui-btn--col"><button type="button">-</button></div>');
					$elms.visualEditorUi.append($btnAddAfter);
					$btnAddAfter
						.css({
							"position": "absolute",
							"left": scanedTable.tbody[row].cols[col].offset.left - offset.left + 50,
							"width": scanedTable.tbody[row].cols[col].width,
							"top": 10,
						})
					;
					$btnAddAfter.find('button')
						.attr({
							"data-col-number": col,
						})
						.on('click.table-tag-editor', function(e){
							// --------------------------------------
							// 列を削除する
							var $this = $(this);
							var targetColNumber = Number($this.attr('data-col-number'));
							rowQueryList.forEach(function(rowQueryInfo, rowQueryIndex){
								var colspanIncrementedMemo = {};
								var $trs = $elms.previewTable.find(rowQueryInfo.query);
								var cellsToRemove = [];
								// 第1段階: colspan の減算のみ行う（DOM を変えずに参照を正しく解決）
								for( var rowIndex = 0; rowIndex < scanedTable[rowQueryInfo.section].length; rowIndex ++ ){
									var scanedCellInfo = scanedTable[rowQueryInfo.section][rowIndex].cols[targetColNumber];
									var isCombinedCell = false;
									if(scanedCellInfo.reference){
										var tmpReference = scanedCellInfo.reference;
										if( targetColNumber >= tmpReference.col ){
											var $tmpCell = $trs.eq(tmpReference.domRow).find('>th, >td').eq(tmpReference.domCol);
											var tmpColspan = Number($tmpCell.attr('colspan'));
											if( !colspanIncrementedMemo[tmpReference.domRow+":"+tmpReference.domCol] ){
												if( !tmpColspan ){ tmpColspan = 1; }
												if( tmpColspan >= 2 ){
													colspanIncrementedMemo[tmpReference.domRow+":"+tmpReference.domCol] = true;
													tmpColspan --;
													if( tmpColspan >= 2 ){
														$tmpCell.attr({'colspan': tmpColspan});
													}else{
														$tmpCell.removeAttr('colspan');
													}
												}
											}
										}
										isCombinedCell = true;
									}else if(scanedCellInfo.colspan >= 2){
										var $tmpCell = $trs.eq(scanedCellInfo.domRow).find('>th, >td').eq(scanedCellInfo.domCol);
										var tmpColspan = Number($tmpCell.attr('colspan'));
										if( !colspanIncrementedMemo[scanedCellInfo.domRow+":"+scanedCellInfo.domCol] ){
											if( !tmpColspan ){ tmpColspan = 1; }
											if( tmpColspan >= 2 ){
												colspanIncrementedMemo[scanedCellInfo.domRow+":"+scanedCellInfo.domCol] = true;
												tmpColspan --;
												if( tmpColspan >= 2 ){
													$tmpCell.attr({'colspan': tmpColspan});
												}else{
													$tmpCell.removeAttr('colspan');
												}
											}
										}
										isCombinedCell = true;
									}
									if( !isCombinedCell ){
										if( !scanedCellInfo.reference && scanedCellInfo.colspan && scanedCellInfo.colspan >= 2 ){
											// 実体自身で、かつcolspanしている場合、削除しない
										}else{
											cellsToRemove.push({ rowIndex: rowIndex, domCol: scanedCellInfo.domCol });
										}
									}
								}
								// 第2段階: 下の行からセルを削除（上の行を先に削除すると domCol がずれるため）
								for( var i = cellsToRemove.length - 1; i >= 0; i -- ){
									var target = cellsToRemove[i];
									$trs.eq(target.rowIndex).find('>th, >td').eq(target.domCol).remove();
								}
							});

							main.save();
						});

					break;
				}
			}
		}
	}
}
