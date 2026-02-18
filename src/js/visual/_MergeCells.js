/**
 * visual/_MergeCells.js
 */
module.exports = function( main, $, $elms ){
	var _this = this;
	var scanedTable = {};
	var TableScanner = require('../_TableScanner');
	var rowQueryList = [
		{"section": "thead", "query": '>thead>tr'},
		{"section": "tfoot", "query": '>tfoot>tr'},
		{"section": "tbody", "query": '>tbody>tr,>tr'},
	];

	var anchor = null; // { section, logicalRow, logicalCol }
	var focus = null;

	var labels = {
		merge: main.options('lang') === 'ja' ? '結合' : 'Merge',
		unmerge: main.options('lang') === 'ja' ? '結合解除' : 'Unmerge',
	};

	/**
	 * クリックされたセルから section と論理位置を取得
	 */
	function getSectionAndLogicalPos($cell){
		var $tr = $cell.closest('tr');
		if(!$tr.length){ return null; }
		var section;
		if($tr.closest('thead').length){ section = 'thead'; }
		else if($tr.closest('tfoot').length){ section = 'tfoot'; }
		else{ section = 'tbody'; }
		var $sectionTrs = $tr.parent().find('>tr');
		var domRow = $sectionTrs.index($tr);
		var domCol = $tr.find('>th,>td').index($cell);
		var rows = scanedTable[section];
		if(!rows || !rows[domRow]){ return null; }
		var cols = rows[domRow].cols;
		var realMatch = null;
		var refMatch = null;
		for(var i = 0; i < cols.length; i++){
			var info = cols[i];
			if(!info){ continue; }
			if(info.reference){
				if(info.reference.domRow === domRow && info.reference.domCol === domCol){ refMatch = { section: section, logicalRow: domRow, logicalCol: i }; }
			}else{
				if(info.domRow === domRow && info.domCol === domCol){ realMatch = { section: section, logicalRow: domRow, logicalCol: i }; }
			}
		}
		return realMatch || refMatch || null;
	}

	/**
	 * 論理位置から実体セルの DOM 情報を取得（reference の場合は参照先の domRow/domCol）
	 */
	function getRealCellDomPos(section, logicalRow, logicalCol){
		var cellInfo = scanedTable[section][logicalRow].cols[logicalCol];
		if(!cellInfo){ return null; }
		if(cellInfo.reference){
			return { domRow: cellInfo.reference.domRow, domCol: cellInfo.reference.domCol };
		}
		return { domRow: cellInfo.domRow, domCol: cellInfo.domCol };
	}

	/**
	 * 選択範囲の矩形を取得（同一 section のみ）
	 */
	function getSelectionRect(){
		if(!anchor || !focus || anchor.section !== focus.section){ return null; }
		var minRow = Math.min(anchor.logicalRow, focus.logicalRow);
		var maxRow = Math.max(anchor.logicalRow, focus.logicalRow);
		var minCol = Math.min(anchor.logicalCol, focus.logicalCol);
		var maxCol = Math.max(anchor.logicalCol, focus.logicalCol);
		return { section: anchor.section, minRow: minRow, maxRow: maxRow, minCol: minCol, maxCol: maxCol };
	}

	/**
	 * 選択範囲のハイライトを更新
	 */
	function updateSelectionHighlight(){
		$elms.previewTable.find('th, td').removeClass('table-tag-editor__cell-selection');
		var rect = getSelectionRect();
		if(!rect){ return; }
		var section = rect.section;
		var rowQueryInfo = rowQueryList.filter(function(r){ return r.section === section; })[0];
		if(!rowQueryInfo){ return; }
		var $trs = $elms.previewTable.find(rowQueryInfo.query);
		var highlighted = {};
		for(var r = rect.minRow; r <= rect.maxRow; r++){
			for(var c = rect.minCol; c <= rect.maxCol; c++){
				var pos = getRealCellDomPos(section, r, c);
				if(!pos){ continue; }
				var key = pos.domRow + ':' + pos.domCol;
				if(highlighted[key]){ continue; }
				highlighted[key] = true;
				$trs.eq(pos.domRow).find('>th,>td').eq(pos.domCol).addClass('table-tag-editor__cell-selection');
			}
		}
	}

	/**
	 * 矩形内の実体セル（reference が null）の dom 位置を列挙（左上が先頭）
	 */
	function getRealCellsInRect(rect){
		var list = [];
		for(var r = rect.minRow; r <= rect.maxRow; r++){
			for(var c = rect.minCol; c <= rect.maxCol; c++){
				var cellInfo = scanedTable[rect.section][r].cols[c];
				if(!cellInfo || cellInfo.reference){ continue; }
				list.push({ logicalRow: r, logicalCol: c, domRow: cellInfo.domRow, domCol: cellInfo.domCol });
			}
		}
		return list;
	}

	/**
	 * 結合実行
	 */
	function doMerge(){
		var rect = getSelectionRect();
		if(!rect){ return; }
		var realCells = getRealCellsInRect(rect);
		if(realCells.length < 2){ return; }
		var rowQueryInfo = rowQueryList.filter(function(r){ return r.section === rect.section; })[0];
		if(!rowQueryInfo){ return; }
		var $trs = $elms.previewTable.find(rowQueryInfo.query);
		var keep = realCells[0];
		var $keepCell = $trs.eq(keep.domRow).find('>th,>td').eq(keep.domCol);
		var content = $keepCell.html();
		var tagName = $keepCell.prop('tagName').toLowerCase();
		var newColspan = rect.maxCol - rect.minCol + 1;
		var newRowspan = rect.maxRow - rect.minRow + 1;
		// 削除は右下から（DOM ずれを防ぐ）
		var toRemove = realCells.slice(1).sort(function(a, b){
			if(a.domRow !== b.domRow){ return b.domRow - a.domRow; }
			return b.domCol - a.domCol;
		});
		toRemove.forEach(function(item){
			$trs.eq(item.domRow).find('>th,>td').eq(item.domCol).remove();
		});
		$keepCell.html(content).attr({'contenteditable': true});
		if(newColspan > 1){ $keepCell.attr('colspan', newColspan); } else { $keepCell.removeAttr('colspan'); }
		if(newRowspan > 1){ $keepCell.attr('rowspan', newRowspan); } else { $keepCell.removeAttr('rowspan'); }
		main.save();
		// 再スキャンして UI 更新
		rescanAndRebind();
	}

	/**
	 * 結合解除実行
	 */
	function doUnmerge(){
		var rect = getSelectionRect();
		if(!rect){ return; }
		if(rect.minRow !== rect.maxRow || rect.minCol !== rect.maxCol){ return; }
		var cellInfo = scanedTable[rect.section][rect.minRow].cols[rect.minCol];
		if(!cellInfo){ return; }
		var domRow = cellInfo.reference ? cellInfo.reference.domRow : cellInfo.domRow;
		var domCol = cellInfo.reference ? cellInfo.reference.domCol : cellInfo.domCol;
		var rowQueryInfo = rowQueryList.filter(function(r){ return r.section === rect.section; })[0];
		if(!rowQueryInfo){ return; }
		var $trs = $elms.previewTable.find(rowQueryInfo.query);
		var $cell = $trs.eq(domRow).find('>th,>td').eq(domCol);
		var rowspan = Number($cell.attr('rowspan')) || 1;
		var colspan = Number($cell.attr('colspan')) || 1;
		if(rowspan < 2 && colspan < 2){ return; }
		var content = $cell.html();
		var tagName = $cell.prop('tagName').toLowerCase();
		var cellIndexInRow = $cell.parent().find('>th,>td').index($cell);
		$cell.remove();
		// 1行目: colspan 個のセルを挿入（先頭に元の内容、残りは空白）
		var $tr = $trs.eq(domRow);
		var $sibling = $tr.find('>th,>td').eq(cellIndexInRow);
		for(var c = colspan - 1; c >= 0; c--){
			var $newCell = $('<' + tagName + '>').attr({'contenteditable': true});
			if(c === 0){ $newCell.html(content); }
			if($sibling.length){ $sibling.before($newCell); }
			else{ $tr.append($newCell); }
			$sibling = $newCell;
		}
		// 2行目以降: 各行に colspan 個の空セルを先頭に挿入
		for(var r = 1; r < rowspan; r++){
			var $nextTr = $trs.eq(domRow + r);
			for(var c = colspan - 1; c >= 0; c--){
				$nextTr.prepend($('<' + tagName + '>').attr({'contenteditable': true}));
			}
		}
		main.save();
		rescanAndRebind();
	}

	function rescanAndRebind(){
		var tableScanner = new TableScanner( main, $ );
		scanedTable = tableScanner.scan($elms.previewTable);
		updateSelectionHighlight();
		updateButtonsState();
	}

	function updateButtonsState(){
		var rect = getSelectionRect();
		var canMerge = false;
		var canUnmerge = false;
		if(rect){
			var realCount = getRealCellsInRect(rect).length;
			canMerge = realCount >= 2;
			if(rect.minRow === rect.maxRow && rect.minCol === rect.maxCol){
				var cellInfo = scanedTable[rect.section][rect.minRow].cols[rect.minCol];
				if(cellInfo){
					var domRow = cellInfo.reference ? cellInfo.reference.domRow : cellInfo.domRow;
					var domCol = cellInfo.reference ? cellInfo.reference.domCol : cellInfo.domCol;
					var rowQueryInfo = rowQueryList.filter(function(r){ return r.section === rect.section; })[0];
					if(rowQueryInfo){
						var $cell = $elms.previewTable.find(rowQueryInfo.query).eq(domRow).find('>th,>td').eq(domCol);
						var rs = Number($cell.attr('rowspan')) || 1;
						var cs = Number($cell.attr('colspan')) || 1;
						canUnmerge = rs >= 2 || cs >= 2;
					}
				}
			}
		}
		$btnMerge.prop('disabled', !canMerge);
		$btnUnmerge.prop('disabled', !canUnmerge);
	}

	var $btnMerge, $btnUnmerge;

	/**
	 * UIをリセットする
	 */
	this.init = function(){
		var offset = $elms.previewTable.offset();
		var tableScanner = new TableScanner( main, $ );
		scanedTable = tableScanner.scan($elms.previewTable);
		anchor = null;
		focus = null;

		// 結合・結合解除ボタンを visualEditorUi に配置
		var $wrap = $('<div class="table-tag-editor__ui-btn table-tag-editor__ui-btn--merge-cells"></div>');
		$btnMerge = $('<button type="button">' + labels.merge + '</button>');
		$btnUnmerge = $('<button type="button">' + labels.unmerge + '</button>');
		$wrap.append($btnMerge).append($btnUnmerge);
		$elms.visualEditorUi.append($wrap);
		$wrap.css({
			position: 'absolute',
			left: 10,
			top: 10,
			flexDirection: 'row',
			gap: '4px',
		});
		$btnMerge.on('click.table-tag-editor', function(e){
			e.preventDefault();
			doMerge();
		});
		$btnUnmerge.on('click.table-tag-editor', function(e){
			e.preventDefault();
			doUnmerge();
		});
		$btnMerge.prop('disabled', true);
		$btnUnmerge.prop('disabled', true);

		// セルクリックで範囲選択
		$elms.previewTable.find('th, td').each(function(){
			var $cell = $(this);
			$cell.off('click.table-tag-editor-merge');
			$cell.on('click.table-tag-editor-merge', function(e){
				var pos = getSectionAndLogicalPos($cell);
				if(!pos){ return; }
				if(e.shiftKey){
					if(anchor && anchor.section === pos.section){
						focus = pos;
					}else{
						anchor = pos;
						focus = pos;
					}
				}else{
					anchor = pos;
					focus = pos;
				}
				updateSelectionHighlight();
				updateButtonsState();
			});
		});
	}
};
