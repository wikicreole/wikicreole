var LeftMenuCollapse =
{
	initialize: function()
	{
		this.name = ("LeftMenuCollapse");
		this.closed = "c";
		this.open = "o";
		var cookie = Cookie.get(this.name);
		this.collapsed = cookie == this.closed;
		this.expanded = !this.collapsed;
		this.button = $("leftMenuCollapse");
		this.collapseDiv = $("collapseButton");
		this.initLeftMenu();
		this.setButton();
	},
	
	initLeftMenu: function()
	{
	    //csauer 2015-08-06: added server side hide
		//for avoiding chrome blinking. $ is not jQuery,
		//but (probably) mootools, so i have to
		//use jQuery directly
		var ssHide = jQuery("#favServerSideHide").eq(0);
	    if (ssHide.length>0)
		{
		    //console.log("this.ssHide.length=" + ssHide.length);
		    jQuery("#favorites").unwrap();
		}
	
		this.slide = new Fx.Slide("favorites", {duration: 300, mode: "horizontal"});
		if(this.collapsed) 
		{
			this.slide.hide();
			this.collapsedButton();
		}
		else
		{
			this.slide.show();
			this.expandedButton();
		}

	},
	
	expandedButton: function()
	{
		this.collapseDiv.setStyle("position", "");
		this.collapseDiv.setProperty("class", "expanded");
	},
	
	collapsedButton: function()
	{
		this.collapseDiv.setStyle("left", "2.3em");
		this.collapseDiv.setStyle("position", "absolute");
		this.collapseDiv.setProperty("class", "collapsed");
	},
	
	setButton: function()
	{
		this.collapseDiv.addEvent("click", function(e)
		{
			LeftMenuCollapse.buttonClick();
		});
	},
	
	buttonClick: function()
	{
		if(this.expanded) 
		{
			this.collapsedButton();
			this.slide.toggle();
			this.setCookie(this.closed);
		}
		else
		{
			this.expandedButton();
			this.slide.toggle();
			this.setCookie(this.open);
		}
		this.expanded = !this.expanded;
	},
	
	setCookie: function(value)
	{
		Cookie.set(this.name, value, {path:Wiki.BasePath, duration:20});
	}
}

var CommentBoxCollapse =
{
	alreadyRan : false,
	pageName : $$("meta[name=wikiPageName]").getProperty("content")[0],
	
	initialize : function()
	{
		if(this.alreadyRan)
			return;
		this.cookies = new Hash.Cookie(this.pageName + "-commentboxes", {duration: 30});
		var ids = 0;
		$$(".commentBox-middleCenter").each(function(td)
		{
			ids += 1;
			var collapseButton = new Element("div", 
			{
				"class" : "collapseButton"
			});
			var boxWrapper = new Element("div", { "class": "commentboxwrapper"});
			boxWrapper.wrapChildren(td);
			collapseButton.injectTop(td);
			var parent = td.getParent();
			while(!parent.hasClass("commentbox"))
				parent = parent.getParent();
			var commentbox = parent;
			var items = { button : collapseButton, box: boxWrapper, commentbox : commentbox, id : ids };
			collapseButton.addEvent("click", function()
			{
				CommentBoxCollapse.click(items)
			});
			if(CommentBoxCollapse.cookies.hasKey(ids)) {
				setTimeout(function()
				{
					CommentBoxCollapse.hide(items);
				}, 0);
			}
		});
		/* $$(".commentbox").each(function(commentBox) {
			console.log(commentBox);
			commentBox.setStyle("overflow", "auto");
		}); */
		this.searchForCommentboxViewPort();
		this.alreadyRan = true;
	},
	
	searchForCommentboxViewPort: function() {
		$$(".commentboxviewport .commentbox").each(function(commentBox) {
			commentBox.setStyle("overflow", "auto");
		});
		$$(".commentboxviewport .collapseButton").each(function(collapseButton) {
			collapseButton.setStyle("float", "none");
		});
	},
	
	getClosedStyles : function(height) {
		return {width : "20px", visibility: "hidden", clazz : "collapseButton collapsed", height: height};
	},
	
	isOpen : function(items)
	{
		return items.box.getStyle("visibility") != "hidden";
	},
	
	click : function(items)
	{
		if(this.isOpen(items))
		{
			this.hide(items);
		}
		else 
		{
			this.setStyles(items, {width : "", visibility: "visible", clazz : "collapseButton", height: "100%"});
			this.setCookie(items.id, true);
		}
	},
	
	hide : function(items)
	{
		this.setStyles(items, this.getClosedStyles(items.box.clientHeight));
		this.setCookie(items.id, false);
	},
	
	setStyles : function(items, styles)
	{
		items.commentbox.setStyle("width", styles.width);
		items.box.setStyle("visibility", styles.visibility);
		items.button.setProperty("class", styles.clazz);
		items.box.setStyle("height", styles.height);
	},
	
	setCookie : function(id, open) 
	{
		if(open)
			this.cookies.remove(id);
		else
			this.cookies.set(id, "c");
	}
	
}