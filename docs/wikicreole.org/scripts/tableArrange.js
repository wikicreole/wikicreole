var TableArrange =
{
	init: function()
	{
		// setup the toggle arrange button
		Japi.forEach(Japi.query(".tableArrangeBox"), function(arrangeBox, tableIndex)
		{
			var tableParent = Japi.getParent(Japi.getParent(arrangeBox));
			var table = Japi.queryInsideElement(tableParent, "table")[0];
			new SortableOptions(table);
			
			var nameElement = Japi.getInsideElement(tableParent, ".table-arrange-name");
			var name = tableIndex + "";
			if(nameElement)
			{
				name = Japi.getText(nameElement);
			}
			
			var reset = Japi.getInsideElement(Japi.getParent(arrangeBox), ".tableArrangeReset");
			var setGlobal = Japi.getInsideElement(Japi.getParent(arrangeBox), ".tableArrangeSetGlobal");
			var resetGlobal = Japi.getInsideElement(Japi.getParent(arrangeBox), ".tableArrangeResetGlobal");
			
			var hiddenColumnInfo = Japi.getInsideElement(Japi.getParent(arrangeBox), ".tableArrangeHiddenInfo");
			
			var maxIndex = 0;
			
			var numberOfHiddenColumns = 0;
			Japi.bindOnClick(arrangeBox, function(event)
			{
				Japi.stopPropagation(event);
				var checked = Japi.getAttribute(arrangeBox, "checked");
				if(checked)
				{
					Japi.setStyle(reset, "display", "");
					if(setGlobal != null) Japi.setStyle(setGlobal, "display", "");
					if(resetGlobal != null) Japi.setStyle(resetGlobal, "display", "");
				}
				else
				{
					Japi.setStyle(reset, "display", "none");
					if(setGlobal != null) Japi.setStyle(setGlobal, "display", "none");
					if(resetGlobal != null) Japi.setStyle(resetGlobal, "display", "none");
				}
				Japi.forEach(Japi.queryInsideElement(table, ".arrangeHeader"), function(arrangeHeader)
				{
					if(checked)
					{
						Japi.setStyle(arrangeHeader, "display", "");
					}
					else
					{
						Japi.setStyle(arrangeHeader, "display", "none");
					}
					maxIndex++;
				}, this);
				// now show/hide columns based on the checkbox state inside the header
				// if the table-arrange checkbox is checked, all columns are shown regardless
				// of the header checkbox state
				numberOfHiddenColumns = 0;
				Japi.forEach(Japi.queryInsideElement(table, ".arrangeEditPane .checkbox"), function(checkbox, index)
				{
					var columnChecked = Japi.getAttribute(checkbox, "checked");
					if(checked)
					{
						this.showColumn(table, index, true);
					}
					else
					{
						this.showColumn(table, index, columnChecked);
					}
					if(!columnChecked)
					{
						numberOfHiddenColumns++;
					}
				}, this);
				Japi.setHtml(hiddenColumnInfo, numberOfHiddenColumns);
			}, this);
			
			// setup the buttons
			Japi.forEach(Japi.queryInsideElement(table, "tr th"), function(cell, index)
			{
				Japi.forEach(Japi.queryInsideElement(cell, ".arrangeEditPane"), function(editPane, paneIndex)
				{
					cell.isHidden = Japi.getAttribute(editPane, "isHidden") == "true";
					
					var originalIndex = Japi.parseInt(Japi.getAttribute(editPane, "originalIndex"));
					cell.originalColumn = originalIndex;
					editPane.originalColumn = originalIndex;
					cell.name = name;
					
					// setup checkbox
					var checkbox = Japi.getInsideElement(editPane, ".checkbox");
					Japi.bindOnClick(checkbox, function()
					{
						var checked = Japi.getAttribute(checkbox, "checked") == true;
						cell.isHidden = !checked;
						var hiddenJson = this.getHiddenColumns(table);
						this.setHiddenCookie(table, name, hiddenJson);
						Japi.setHtml(hiddenColumnInfo, hiddenJson.hidden.length);
					}, this);
					
					var left = Japi.getInsideElement(editPane, ".left");
					var right = Japi.getInsideElement(editPane, ".right");
					
					// setup left button
					this.setupButton(left, function(currentIndex)
					{
						if(currentIndex == 0)
						{
							return -1;
						}
						return currentIndex - 1;
					}, table, cell, name);
					// setup right button
					this.setupButton(right, function(currentIndex)
					{
						if(currentIndex == maxIndex - 1)
						{
							return -1;
						}
						return currentIndex + 1;
					}, table, cell, name);
				}, this);
			}, this);
			
			//setup reset button
			Japi.bindOnClick(reset, function()
			{
				var hiddenJson = { hidden: [ ] };
				var columns = [ ];
				
				var arrange = this;
				Wiki.jsonrpc("tableArrange.setConfigJSON", [Japi.pageName, name, this.userScope, "reset"], function(result)
				{
					if(result != "true")
					{
						arrange.saveCookie(name, arrange.hiddenType, Japi.toJSON(hiddenJson));
						arrange.saveCookie(name, arrange.indexType,  Japi.toJSON( { columns: value } ));
					}
					Japi.reloadPage();
				});
			}, this);
			
			// setup setGlobal button
			if(setGlobal)
			{
				Japi.bindOnClick(setGlobal, function()
				{
					var hiddenJson = this.getHiddenColumns(table);
					var columns = this.getIndexColumns(table);
					
					var config = this.getConfigString(hiddenJson.hidden, columns);
					var arrange = this;
					Wiki.jsonrpc("tableArrange.setConfigJSON", [Japi.pageName, name, this.globalScope, config], function(result)
					{
						
					});
				}, this);
				
				Japi.bindOnClick(resetGlobal, function()
				{
					var arrange = this;
					Wiki.jsonrpc("tableArrange.setConfigJSON", [Japi.pageName, name, this.globalScope, "reset"], function(result)
					{
						
					});
				}, this);
			}
		}, this);
	},
	
	userScope: "user",
	globalScope: "global",
	
	getHiddenColumns: function(table)
	{
		var hiddenJson = { hidden: [ ] };
		Japi.forEach(Japi.queryInsideElement(table, ".arrangeEditPane"), function(cellEditPane, index)
		{
			var cell = Japi.getParent(cellEditPane)
			if(cell.isHidden)
			{
				hiddenJson.hidden.push( { "index": cell.originalColumn } );
			}
		}, this);
		return hiddenJson;
	},
	
	setupButton: function(button, newIndexFunction, table, cell, name)
	{
		var tableArrange = this;
		Japi.bindOnClick(button, function(event)
		{
			var currentIndex = Japi.getIndexOfElement(cell);
			var newIndex = newIndexFunction(currentIndex);
			if(newIndex == -1)
			{
				return;
			}
			tableArrange.moveColumn(table, currentIndex, newIndex, name);
		}, button);
	},
	
	moveColumn: function(table, currentIndex, newIndex, name)
	{
		Japi.forEach(Japi.queryInsideElement(table, "tr"), function(row)
		{
			Japi.forEach(Japi.queryInsideElement(row, "th"), function(cell, index)
			{
				if(currentIndex == index)
				{
					this.moveCell(row, cell, newIndex);
					return false;
				}
			}, this);
			Japi.forEach(Japi.queryInsideElement(row, "td"), function(cell, index)
			{
				if(currentIndex == index)
				{
					this.moveCell(row, cell, newIndex);
					return false;
				}
			}, this);
		}, this);
		var columns = this.getIndexColumns(table);
		this.setIndexCookie(table, name, columns);
	},
	
	getIndexColumns: function(table)
	{
		var columns = [ ];
		Japi.forEach(Japi.queryInsideElement(table, ".arrangeEditPane"), function(cell, index)
		{
			columns.push(cell.originalColumn);
		}, this);
		return columns;
	},
	
	moveCell: function(row, cell, newIndex)
	{
		Japi.detachFromParent(cell);
		Japi.appendChildAtIndex(row, cell, newIndex);
	},
	
	showColumn: function(table, columnIndex, showColumn)
	{
		function showCell(cell, index)
		{
			if(index == columnIndex && Japi.getAttribute(cell, "class") != "arrangeHeader")
			{
				if(showColumn)
				{
					Japi.setStyle(cell, "display", "");
				}
				else
				{
					Japi.setStyle(cell, "display", "none");
				}
			}
		}
		Japi.forEach(Japi.queryInsideElement(table, "tr"), function(row)
		{
			Japi.forEach(Japi.queryInsideElement(row, "th"), showCell);
			Japi.forEach(Japi.queryInsideElement(row, "td"), showCell);
		});
	},
	
	hiddenType: "hidden",
	
	setHiddenCookie: function(table, name, value)
	{
		var arrange = this;
		var json = Japi.toJSON(value);
		var indexColumns = this.getIndexColumns(table);
		console.log("Japi.pageName: " + Japi.pageName);
		Wiki.jsonrpc("tableArrange.setConfigJSON", [Japi.pageName, name, this.userScope, this.getConfigString(value.hidden, indexColumns)], function(result)
		{
			if(result != "true")
			{
				arrange.saveCookie(name, arrange.hiddenType, json);
			}
		});
	},
	
	getConfigString: function(hidden, columns)
	{
		var config = 
		{
			hidden: hidden,
			columns: columns
		}
		return Japi.toJSON(config);
	},
	
	indexType: "index",
	
	setIndexCookie: function(table, name, value)
	{
		var json = Japi.toJSON( { columns: value } );
		var arrange = this;
		var hiddenColumns = this.getHiddenColumns(table);
		Wiki.jsonrpc("tableArrange.setConfigJSON", [Japi.pageName, name, this.userScope, this.getConfigString(hiddenColumns.hidden, value)], function(result)
		{
			if(result != "true")
			{
				arrange.saveCookie(name, arrange.indexType, json);
			}
		});
	},
	
	saveCookie: function(name, type, value)
	{
		var pagename = Japi.pageName;
		var key = pagename + "-" + name + "-" + type;
		//console.log("cookie key: " + key + ", value: " + Japi.toJSON(value));
		key = Japi.encodeUri(key);
		Japi.setPermanentCookie(key, "" + value);
	}
}
