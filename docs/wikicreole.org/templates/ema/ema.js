RoundedElement.register('.commentbox', {elementName:'commentBox', width1:'8px', width2:'100%', width3:'8px', height1:'8px', height2:'auto', height3:'8px'});
RoundedElement.register('.headerContent', {elementName:'pageHeader', width1:'8px', width2:'100%', width3:'8px', height1:'7px', height2:'auto', height3:'8px'});
RoundedElement.register('.editContentTop', {elementName:'pageHeader', width1:'8px', width2:'100%', width3:'8px', height1:'7px', height2:'auto', height3:'8px'});
RoundedElement.register('.information', {elementName:'infoBox', icon:true, iconWidth:'34px', iconHeight:'24px', width1:'34px', width2:'100%', width3:'7px', height1:'7px', height2:'auto', height3:'7px', noTotalWidth:true});
RoundedElement.register('.warning', {elementName:'warningBox', icon:true, iconWidth:'34px', iconHeight:'24px', width1:'34px', width2:'100%', width3:'7px', height1:'7px', height2:'auto', height3:'7px', noTotalWidth:true});
RoundedElement.register('.error', {elementName:'errorBox', icon:true, iconWidth:'34px', iconHeight:'24px', width1:'34px', width2:'100%', width3:'7px', height1:'7px', height2:'auto', height3:'7px', noTotalWidth:true});

RoundedElement.render();

var body = $("wikibody").parentNode;
var middleLeft = $("middleLeft");
var middleRight = $("middleRight");

document.addEvent("click", function(e) {
	e = new Event(e);
	if(e.target == body || e.target == middleLeft || e.target == middleRight) 
	{
		window.location.hash="top";
	}
});

MoveCols = {

	init: function() {
		this.cookie = new Hash.Cookie("MoveColsCookie");
		cookie.load();
		$$(".move-cols table").each(function(table, index) {
			var firstRow = $E("tr", table);
			// save position of table on page
			table.moveColsIndex = index;
			firstRow.getChildren().each(function(cell, index) {
			    // save the default position of the cell inside the table
				cell.moveColsIndex = index;
				this.setupCell(cell, table, index);
			}.bind(this));
		}.bind(this));
		this.cookieCheck();
	},
	
	/**
	*	Creates the move right/left buttons and adds onclick functions to them
	*   @param {object} cell The header cell element of the table.
	*   @param {object} table
	*/
	setupCell: function(cell, table) {
		var left = new Element("span", {"class": "move-cols move-left"}).injectTop(cell);
		left.setHTML("&lt; ");
		var right = new Element("span", { "class": "move-cols move-right"}).injectInside(cell);
		right.setHTML(" &gt;");
		
		left.addEvent("click", this.leftClick.bind(this, cell, table));
		
		right.addEvent("click", this.rightClick.bind(this, cell, table));
	},
	
	/**
	 * Called at startup. Compares the default cell positions to the ones saved inside
	 * the cookie and inserts the cells accordingly.
	 */
	cookieCheck: function() {
		$$(".move-cols table").each(function(table, index) {
			var firstRow = $E("tr", table);
			var children = firstRow.getChildren();
			var firstRowLength = children.length;
			var insertOrder = this.createInsertOrder(children, table);
			$ES("tr", table).each(function(row, tableIndex) {
				var children = row.getChildren();
				for(var i = 0; i < firstRowLength; i++) {
					var insertIndex = insertOrder[i];
					children[insertIndex].injectInside(row);
				}
				this.setCurrentIndexes(table, row.getChildren());
			}.bind(this));
		}.bind(this));
	},
	
	/**
	 * Creates the cell insert order array based on the information in the cookie.
	 * 
	 * @param {array} children The header row of the table.
	 * @param {object} table
	 * @return {json} Mapping between actual position and default position. The key is the saved position of the cell
	 *                with its default position as the value.
	 */
	createInsertOrder: function(children, table) {
		var insertOrder = {};
		for(var i = 0; i < children.length; i++) {
			var cookieIndex = this.cookie.get("" + table.moveColsIndex + i);
			if(cookieIndex != undefined) {
				insertOrder[cookieIndex] = i;
			}
			else {
				insertOrder[i] = i;
			}
		}
		return insertOrder;
	},
	
	leftClick: function(cell, table) {
		var cellIndex = this.getCellIndex(cell, table);
		if(cellIndex > 0) {
			this.moveCell(cell, "left", table, cellIndex);
		}
	},
	
	rightClick: function(cell, table) {
		var cellIndex = this.getCellIndex(cell, table);
		if(cellIndex < $E("tr", table).getChildren().length - 1) {
			this.moveCell(cell, "right", table, cellIndex);
		}
	},
	
	getCellIndex: function(cell, table) {
		var cellIndex = 0;
		var firstRow = $E("tr", table);
		firstRow.getChildren().each(function(innerCell, index) {
			if(this == innerCell) {
				cellIndex = index;
			}
		}.bind(cell));
		return cellIndex;
	},
	
	/**
	 * Moves the cell inside the tr row based on the given direction.
	 */
	moveCell: function(cell, direction, table, cellIndex) {
		$ES("tr", table).each(function(row) {
			row.getChildren().each(function(rowCell, index) {
				if(index == cellIndex) {
					if(direction == "left") {
						rowCell.injectBefore(rowCell.getPrevious());
					}
					else if(direction == "right") {
						rowCell.injectAfter(rowCell.getNext());
					}
				}
			});
			this.setCurrentIndexes(table, row.getChildren());
		}.bind(this));
	},
	
	/**
	 * Saves new indexes inside the cookie. Also looks out for the table-filter and adjusts those indexes. 
	 */
	setCurrentIndexes: function(table, children) {
		children.each(function(rowCell, index) {
			if(rowCell.moveColsIndex != undefined) {
				this.cookie.set("" + table.moveColsIndex + rowCell.moveColsIndex, index);
				this.cookie.save();
			}
			// account for table-filter
			if(rowCell.getFirst() && rowCell.getFirst().fcol != undefined) {
				rowCell.getFirst().fcol = index;
			}
		}.bind(this));
	}
}

MoveCols.init();