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
		// 行追加ボタンを配置
		rowQueryList.forEach(function(rowQueryInfo, rowQueryIndex){
			$elms.previewTable.find(rowQueryInfo.query)
				.each(function(index, trElm){
					var $trElm = $(trElm);
					var $btnAddAfter = $('<button class="table-tag-editor__ui-btn table-tag-editor__ui-btn--add">+</button>');
					$elms.visualEditorUi.append($btnAddAfter);
					$btnAddAfter
						.css({
							"position": "absolute",
							"left": 10,
							"top": $trElm.offset().top - offset.top + 40 + $trElm.height() - 10,
						})
						.attr({
							"data-table-section": rowQueryInfo.section,
							"data-row-number": index,
						})
						.on('click.table-tag-editor', function(e){
							// --------------------------------------
							// 行を追加する
							var $this = $(this);
							var targetRowNumber = Number($this.attr('data-row-number'));
							var targetTableSection = $this.attr('data-table-section');
							var $newRow = $('<tr>');
							var rowspanIncrementedMemo = {};
							for(var i = 0; i < scanedTable[targetTableSection][targetRowNumber].cols.length; i ++){
								var tagName = 'td';

								var isCombinedCell = false;
								if( scanedTable[targetTableSection][targetRowNumber+1] && scanedTable[targetTableSection][targetRowNumber+1].cols[i] && scanedTable[targetTableSection][targetRowNumber+1].cols[i].reference ){
									// 結合セルの解決
									isCombinedCell = (function(){
										var tmpReference = scanedTable[targetTableSection][targetRowNumber+1].cols[i].reference;
										if( targetRowNumber < tmpReference.row ){
											// 結合先が自身より後ろの場合
											return false;
										}
										var $tmpCell = $elms.previewTable.find(rowQueryInfo.query).eq(tmpReference.domRow).find('>th, >td').eq(tmpReference.domCol);
										var tmpRowspan = Number($tmpCell.attr('rowspan'));
										if( rowspanIncrementedMemo[tmpReference.domRow+":"+tmpReference.domCol] ){
											// 処理済みのセルはスキップ
											return true;
										}
										if( !tmpRowspan ){ tmpRowspan = 1; }
										if( tmpRowspan >= 2 ){
											// 2以上の場合のみ、結合されているものとみなす
											rowspanIncrementedMemo[tmpReference.domRow+":"+tmpReference.domCol] = true;

											tmpRowspan ++;
											$tmpCell.attr({'rowspan': tmpRowspan});
											return true;
										}
										return false;
									})();
								}
								if( !isCombinedCell ){
									// td, or th を決める
									if( rowQueryInfo.section != 'tbody' ){
										tagName = 'th';
									}else if( scanedTable[targetTableSection][targetRowNumber].cols[i].tagName ){
										tagName = scanedTable[targetTableSection][targetRowNumber].cols[i].tagName;
									}

									$newRow.append($('<'+tagName+'>')
										.attr({'contenteditable': true})
									);
								}
							}
							$elms.previewTable.find(rowQueryInfo.query).eq(targetRowNumber).after($newRow);
							main.save();
						});
				})
				;
		});

		// --------------------------------------
		// 列追加ボタンを配置
		if( scanedTable.tbody.length ){
			for( var col = 0; scanedTable.tbody[0].cols.length > col; col ++ ){			
				for( var row = 0; scanedTable.tbody.length > row; row ++ ){
					if( !scanedTable.tbody[row].cols[col].offset ){
						continue;
					}

					var $btnAddAfter = $('<button class="table-tag-editor__ui-btn table-tag-editor__ui-btn--add">+</button>');
					$elms.visualEditorUi.append($btnAddAfter);
					$btnAddAfter
						.css({
							"position": "absolute",
							"left": scanedTable.tbody[row].cols[col].offset.left - offset.left + 50 + scanedTable.tbody[row].cols[col].width - 0,
							"top": 10,
						})
						.attr({
							"data-col-number": col,
						})
						.on('click.table-tag-editor', function(e){
							// --------------------------------------
							// 列を追加する
							var $this = $(this);
							var targetColNumber = Number($this.attr('data-col-number'));
							rowQueryList.forEach(function(rowQueryInfo, rowQueryIndex){
								var colspanIncrementedMemo = {};
								var $trs = $elms.previewTable.find(rowQueryInfo.query);
								for( var rowIndex = 0; rowIndex < scanedTable[rowQueryInfo.section].length; rowIndex ++ ){
									var tagName = 'td';
									var scanedCellInfo = scanedTable[rowQueryInfo.section][rowIndex].cols[targetColNumber];
									var isCombinedCell = false;
									if(scanedCellInfo.reference){
										// 結合セルの解決
										isCombinedCell = (function(){
											var tmpReference = scanedCellInfo.reference;
											if( targetColNumber < tmpReference.col ){
												// 結合先が自身より後ろの場合
												return false;
											}
											var $tmpCell = $trs.eq(tmpReference.domRow).find('>th, >td').eq(tmpReference.domCol);
											var tmpColspan = Number($tmpCell.attr('colspan'));
											if( colspanIncrementedMemo[tmpReference.domRow+":"+tmpReference.domCol] ){
												// 処理済みのセルはスキップ
												return true;
											}
											if( !tmpColspan ){ tmpColspan = 1; }
											if( tmpColspan >= 2 ){
												// 2以上の場合のみ、結合されているものとみなす
												colspanIncrementedMemo[tmpReference.domRow+":"+tmpReference.domCol] = true;

												tmpColspan ++;
												$tmpCell.attr({'colspan': tmpColspan});
												return true;
											}
											return false;
										})();
									}else if(scanedCellInfo.colspan >= 2){
										// 結合セルの結合先が自身の場合の解決
										isCombinedCell = (function(){
											var $tmpCell = $trs.eq(scanedCellInfo.domRow).find('>th, >td').eq(scanedCellInfo.domCol);
											var tmpColspan = Number($tmpCell.attr('colspan'));
											if( colspanIncrementedMemo[scanedCellInfo.domRow+":"+scanedCellInfo.domCol] ){
												// 処理済みのセルはスキップ
												return true;
											}
											if( !tmpColspan ){ tmpColspan = 1; }
											if( tmpColspan >= 2 ){
												// 2以上の場合のみ、結合されているものとみなす
												colspanIncrementedMemo[scanedCellInfo.domRow+":"+scanedCellInfo.domCol] = true;

												tmpColspan ++;
												$tmpCell.attr({'colspan': tmpColspan});
												return true;
											}
											return false;
										})();
									}
									if( !isCombinedCell ){
										// 実体セルの場合
										try {
											// td, or th を決める
											if( rowQueryInfo.section != 'tbody' ){
												tagName = 'th';
											}else if( scanedTable[rowQueryInfo.section][rowIndex].cols[scanedCellInfo.col].tagName ){
												tagName = scanedTable[rowQueryInfo.section][rowIndex].cols[scanedCellInfo.col].tagName;
											}
										} catch(e){}
										var $newCol = $('<'+tagName+'>')
											.attr({'contenteditable': true})
										;
										if( !scanedCellInfo.reference && scanedCellInfo.colspan && scanedCellInfo.colspan >= 2 ){
											// 実体自身で、かつcolspanしている場合、挿入しない
										}else if( scanedCellInfo.reference && scanedTable[rowQueryInfo.section][scanedCellInfo.reference.row].cols[scanedCellInfo.reference.col].rowspan >= 2 && targetColNumber == 0 ){
											// 0列目に実体がない場合は、tr の先頭に挿入する。
											$trs.eq(rowIndex).prepend( $newCol );
										}else{
											$trs.eq(rowIndex).find('>th, >td').eq(scanedCellInfo.domCol).after( $newCol );
										}
									}
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
