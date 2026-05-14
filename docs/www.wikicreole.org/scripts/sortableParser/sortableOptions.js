function SortableOptions(table) 
{ 
	if(!table.sortableOptions)
	{
		var options = this.loadOptions(table);
		options = this.checkOptions(options, table);
		this.options = options;
		table.sortableOptions = this;
	}
	return table.sortableOptions;
}

SortableOptions.prototype =
{
	
	defaultOptions:
	{
		footerStart: 0,
		headerEnd: 0,
		ignoreMap: { }
	},
	
	checkOptions: function(options, table)
	{
		if(this.defaultOptions.headerEnd == options.headerEnd)
		{
			options.headerEnd = this.determineHeaderEnd(table, options);
		}
		if(this.defaultOptions.footerStart == options.footerStart)
		{
			options.footerStart = this.determineFooterStart(table);
		}
		return options;
	},
	
	areAllCellsHeaderCells: function(row, options)
	{
		var cells = row.cells;
		var allCellsTh = true;
		Japi.forEach(cells, function(cell)
		{
			var tag = Japi.getAttribute(cell, "tagName");
			allCellsTh = allCellsTh && tag.toLowerCase() == "th";
			if(!allCellsTh)
			{
				return false;
			}
		}, this);
		return allCellsTh;
	},
	
	determineHeaderEnd: function(table, options)
	{
		var headerEnd = 0;
		var rows = table.rows;
		rows = Japi.queryInsideElement(table, "tr");
		Japi.forEach(rows, function(row, index)
		{
			var allCellsTh = this.areAllCellsHeaderCells(row, options);
			if(!allCellsTh)
			{
				headerEnd = index == 0 ? 0 : index - 1;
				return false;
			}
		}, this);
		return headerEnd;
	},
	
	determineFooterStart: function(table)
	{
		var footerStart = 0;
		var rows = table.rows;
		rows = Japi.queryInsideElement(table, "tr");
		for(var i = rows.length - 1; i >= 0; i--)
		{
			var allCellsTh = this.areAllCellsHeaderCells(rows[i]);
			if(!allCellsTh)
			{
				footerStart = rows.length - i - 1;
				break;
			}
		}
		return footerStart;
	},
	
	loadOptions: function(table)
	{
		var optObj = Japi.queryInsideElement(Japi.getParent(table), ".sortableOptions")[0];
		if(optObj != null)
		{
			return Japi.parseJSON(Japi.getAttribute(optObj, "script"));
		}
//		return this.defaultOptions;
		return Japi.copyJSON(this.defaultOptions);
	},
	
	includeRow: function(index, length, isFilterUsed)
	{
		if(this.isHeader(index, isFilterUsed) || this.isBottom(index, length))
		{
			return false;
		}
		return true;
	},
	
	isBottom: function(index, length)
	{
		return index >= length - this.options.footerStart;
	},
	
	isHeader: function(index, isFilterUsed)
	{
		return index <= this.getHeaderEnd(isFilterUsed);
	},
	
	getHeaderEnd: function(isFilterUsed)
	{
		var headerEnd = this.options.headerEnd;
		if(isFilterUsed)
		{
			headerEnd += 1;
		}
		return headerEnd;
	},
	
	getIgnoreMap: function()
	{
		return this.options.ignoreMap;
	}
}
