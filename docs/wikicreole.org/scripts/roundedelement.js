var RoundedElement = 
{
	templateUrl: $$("meta[name=wikiTemplateUrl]").getProperty("content")[0],
	
	register: function(selector, paraObject)
    {
		if(!this.registry) this.registry = new Hash();
		if(!this.blacklistHash) this.blacklistHash = new Hash();
		if(!this.registry.hasKey(selector) && !this.blacklistHash.hasKey(selector))
        {
			this.registry.set(selector, paraObject);
        }
	},
	
	blacklist: function(selector) 
    {
		if(!this.blacklistHash) this.blacklistHash = new Hash();
		this.blacklistHash.set(selector, "");
	},
	
	unregister: function(selector) 
    {
		if(!this.registry) this.registry = new Hash();
		this.registry.remove(selector);
	},
		
	render: function(page,name)
    {
		var IE7 = navigator.appVersion.indexOf("MSIE 7.")!=-1;
		if(!IE7) {
			if(!this.registry) this.registry = new Hash();
			this.registry.each(function(paraObject, selector) 
			{
				var elements = $$(selector);
				//this.makeRound(elements, paraObject[0], paraObject[1], paraObject[2], skin);
				this.makeRound(elements, paraObject);
			}, this);
		}
	},
	
	makeRound: function(elements, paraObject) 
    {
		elements.each(function(element) 
        {
			// check if we've already been here
			if(!(element.getFirst() && element.getFirst().hasClass("roundedtable"))) {
				this.elementName = paraObject.elementName;
				this.skin = paraObject.skin;
			
				//class vars 
				var tableClass = paraObject.elementName + "-table";
				if( element.getFirst() && element.getFirst().hasClass(tableClass) ) return;
				
				var innerContent = element.getChildren();
				var table = new Element("table", {"class":tableClass + " roundedtable"});
				if(!paraObject.noTotalWidth) 
				{
					table.setStyle("width", "99%");
				}
				else
				{
					element.setStyle("width", "100%");
				}
				table.setStyle("empty-cells", "show");
				
				/******TOP ROW*******/
				//define Top Row
				var topRow = new Element("tr");
				topRow.appendChild(this.getCell("topLeft",paraObject.width1,paraObject.height1));
				topRow.appendChild(this.getCell("topCenter",paraObject.width2,paraObject.height1));
				topRow.appendChild(this.getCell("topRight",paraObject.width3,paraObject.height1));
				table.appendChild(topRow);
				
				/******MIDDLE ROW*******/
				//define Middle Row
				var middleRow = new Element("tr");
				var middleLeftCell = this.getCell("middleLeft",paraObject.width1,paraObject.height2);
				if(typeof paraObject.icon != "undefined" && paraObject.icon)
				{
					var url = this.getImageURL("icon");
					var iconDiv = new Element("div");
					iconDiv.setStyles({
						width: paraObject.iconWidth,
						height: paraObject.iconHeight,
						"background-image": "url(" + url + ")",
						"background-repeat": "no-repeat",
						"margin-left": "0px",
						"vertical-align" : "top"
					});
					middleLeftCell.setStyle("vertical-align", "top");
					middleLeftCell.appendChild(iconDiv);
				}
				middleRow.appendChild(middleLeftCell);
				
				var middleCenterCell = this.getCell("middleCenter","100%","auto");
				middleCenterCell.wrapChildren(element);
				middleRow.appendChild(middleCenterCell);
				
				middleRow.appendChild(this.getCell("middleRight",paraObject.width3,paraObject.height2));
				
				//add Top Row
				table.appendChild(middleRow);
				
				/******BOTTOM ROW*******/
				
				var bottomRow = new Element("tr");
				bottomRow.appendChild(this.getCell("bottomLeft",paraObject.width1,paraObject.height3));
				bottomRow.appendChild(this.getCell("bottomCenter",paraObject.width2,paraObject.height3));
				bottomRow.appendChild(this.getCell("bottomRight",paraObject.width3,paraObject.height3));
				table.appendChild(bottomRow);
				
				element.empty();
				element.appendChild(table);
			}  
		},this);
	},
	
	getCell: function(name, cellWidth, cellHeight) 
    {
        //document.writeln(name + ": w:" + cellWidth + ", h:"+cellHeight);
    
        var elementName = this.elementName;
		var className = elementName + "-" + name;
		var cell = new Element("td", {"class":className + " roundedtableCell"});
        
        var url = this.getImageURL(name);
		cell.setStyle("backgroundImage","url(" + url + ")");
        if(typeof cellWidth != "undefined") cell.setStyle("width",cellWidth);
        if(typeof cellHeight != "undefined") cell.setStyle("height",cellHeight);
        
        //this goddamn fucking ie just gives me annoying problems here because somehow if one value is undefined it breaks
        //completely, even if i would add a +"".
        /*
		cell.setStyles({
			"width": cellWidth,
			"height": cellHeight,
			"backgroundImage": "url(" + url + ")"
		});
        */
        
        if(typeof cellWidth != "undefined")
        {
            var expandDiv = new Element("div");
            expandDiv.setStyle("width", cellWidth);
            cell.appendChild(expandDiv);
        }
		return cell;
	},
    
    getImageURL: function(name)
    {
        var elementName = this.elementName;
        var skin = this.skin;
       
		var url = this.templateUrl + "images/" + elementName + "/" + name + ".png";
		
        return url;
    }
}