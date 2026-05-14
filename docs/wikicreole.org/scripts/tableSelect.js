var TableSelect =
{
	init: function()
	{
		var numberOfSingles = 0;
		Japi.forEach(Japi.query(".table-select, .table-selectsingle, .table-selectmultiple"), function(tableSelect, selectIndex)
		{
			var single = Japi.getAttribute(tableSelect, "class") == "table-selectsingle";
			if(single)
			{
				numberOfSingles++;
			}
			selectIndex -= numberOfSingles;
			var checkboxes = [];
			Japi.forEach(Japi.queryInsideElement(tableSelect, "tr"), function(row, tableIndex)
			{
				var checkbox;
				Japi.forEach(Japi.queryInsideElement(row, "input"), function(input)
				{
					if(Japi.getAttribute(input, "type") == "checkbox")
					{
						checkbox = input;
						checkboxes.push(checkbox);
						return false;
					}
				});
				if(checkbox == undefined)
				{
					return;
				}
				var checked = Japi.checkboxChecked(checkbox);
				if(checked)
				{
					Japi.addClass(row, "selected");
				}
				Japi.bindOnClick(row, function(e)
				{
					var targetTag = Japi.getTag(e.target);
					var className = Japi.getAttribute(e.target, "class");
					if((targetTag != "input" || e.target == checkbox) && (className == undefined || className.indexOf("jbtn") == -1))
					{
						var disabled = Japi.getAttribute(checkbox, "disabled");
						if(disabled)
						{
							return;
						}
						var checked = Japi.checkboxChecked(checkbox);
						if(e.target == checkbox)
						{
							checked = !checked;
						}
						if(!checked)
						{
							if(single)
							{
								TableSelect.unselectAll(checkboxes);
							}
							Japi.addClass(row, "selected");
							if(e.target != checkbox || single)
							{
								Japi.setAttribute(checkbox, "checked", "checked");
							}
						}
						else
						{
							Japi.removeClass(row, "selected");
							if(e.target != checkbox)
							{
								Japi.removeAttribute(checkbox, "checked");
							}
						}
					}
				});
			});
			if(!single)
			{
				Japi.forEach(Japi.queryInsideElement(tableSelect, "table"), function(table)
				{
					var selectAll = Japi.byId("SelectAll" + selectIndex)
					var unselectAll = Japi.byId("UnselectAll" + selectIndex);
					Japi.removeAttribute(selectAll, "onclick");
					Japi.removeAttribute(unselectAll, "onclick");
					Japi.bindOnClick(selectAll, function()
					{
						Japi.forEach(checkboxes, function(checkbox)
						{
							var checked = Japi.checkboxChecked(checkbox);
							if(TableSelect.isVisible(checkbox) && !checked)
							{
								checkbox.click();
							}
						});
					});
					
					Japi.bindOnClick(unselectAll, function()
					{
						TableSelect.unselectAll(checkboxes);
					});
				});
			}
		});
		
	},
	
	unselectAll: function(checkboxes)
	{
		Japi.forEach(checkboxes, function(checkbox)
		{
			var checked = Japi.checkboxChecked(checkbox);
			if(TableSelect.isVisible(checkbox) && checked)
			{
				checkbox.click();
			}
		});
	},
	
	isVisible: function(checkbox)
	{
		var cell = Japi.getParent(checkbox);
		var row = Japi.getParent(cell);
		return Japi.getStyle(row, "display") != "none";
	}
};
