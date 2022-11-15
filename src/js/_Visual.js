/**
 * _Visual.js
 */
module.exports = function( main, $, $elms ){
	var _this = this;
	var scanedTable = {};
	var TableScanner = require('./_TableScanner');

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
		$elms.visualEditorUi.html('');
		var offset = $elms.previewTable.offset();
		var tableScanner = new TableScanner( main, $ );
		scanedTable = tableScanner.scan($elms.previewTable);

		// --------------------------------------
		// 行追加ボタンを配置
		$elms.previewTable.find('>tbody>tr, >tr')
			.each(function(index, trElm){
				var $trElm = $(trElm);
				var $btnAddAfter = $('<button class="table-tag-editor__ui-btn">(+)</button>');
				$elms.visualEditorUi.append($btnAddAfter);
				$btnAddAfter
					.css({
						"position": "absolute",
						"left": 0,
						"top": $trElm.offset().top - offset.top + 40 + $trElm.height() - 10,
					})
					.attr({
						"data-row-number": index,
					})
					.on('click.table-tag-editor', function(e){
						var $this = $(this);
						var targetRowNumber = Number($this.attr('data-row-number'));
						var $newRow = $('<tr>');
						var rowspanIncrementedMemo = {};
						for(var i = 0; i < scanedTable.tbody[targetRowNumber].cols.length; i ++){
							var tagName = 'td';

							if( scanedTable.tbody[targetRowNumber+1] && scanedTable.tbody[targetRowNumber+1].cols[i] && scanedTable.tbody[targetRowNumber+1].cols[i].reference ){
								// 結合セルの解決
								(function(){
									var tmpReference = scanedTable.tbody[targetRowNumber+1].cols[i].reference;
									if( rowspanIncrementedMemo[tmpReference.domRow+":"+tmpReference.domCol] ){
										return;
									}
									var $tmpCell = $elms.previewTable.find('>tbody>tr, >tr').eq(tmpReference.domRow).find('th, td').eq(tmpReference.domCol);
									rowspanIncrementedMemo[tmpReference.domRow+":"+tmpReference.domCol] = true;
									var tmpRowspan = Number($tmpCell.attr('rowspan'));
									if( !tmpRowspan ){ tmpRowspan = 1; }
									tmpRowspan ++;
									$tmpCell.attr({'rowspan': tmpRowspan});
								})();
							}else{
								// td, or th を決める
								if( scanedTable.tbody[targetRowNumber].cols[i].tagName ){
									tagName = scanedTable.tbody[targetRowNumber].cols[i].tagName;
								}

								$newRow.append($('<'+tagName+'>')
									.attr({'contenteditable': true})
								);
							}
						}
						$elms.previewTable.find('>tbody>tr, >tr').eq(targetRowNumber).after($newRow);
						main.save();
					});
			})
			;

		// --------------------------------------
		// 列追加ボタンを配置
		for( var col = 0; scanedTable.tbody[0].cols.length > col; col ++ ){			
			for( var row = 0; scanedTable.tbody.length > row; row ++ ){
				if( !scanedTable.tbody[row].cols[col].offset ){
					continue;
				}

				var $btnAddAfter = $('<button class="table-tag-editor__ui-btn">(+)</button>');
				$elms.visualEditorUi.append($btnAddAfter);
				$btnAddAfter
					.css({
						"position": "absolute",
						"left": scanedTable.tbody[row].cols[col].offset.left - offset.left + 40 + scanedTable.tbody[row].cols[col].width - 10,
						"top": 0,
					})
					.attr({
						"data-col-number": col,
					})
					.on('click.table-tag-editor', function(e){
						var $this = $(this);
						alert($this.attr('data-col-number')); // TODO: 後ろに td を追加する
					});

				break;
			}
		}
	}
}
