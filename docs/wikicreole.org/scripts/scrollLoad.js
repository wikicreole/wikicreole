var ScrollHeightRenderer = {
	
	render: function(noJuwiCheck) {
		var juwiForm = $("JuwiForm");
		this.pageName = $$("meta[name=wikiPageName]").getProperty("content")[0];
		var name = this.pageName;
		this.scrollHeight = new Hash.Cookie("scrollHeight");
		var scroll = this.scrollHeight;
		if(juwiForm) {

			juwiForm.addEvent("click", function() {
				scroll.extend({
					'pageName' : name,
					'height' : window.getScrollTop()
				});
			});
		}

		if(this.scrollHeight) {
			if(this.scrollHeight.get("pageName") == this.pageName) {
				window.scroll(0,this.scrollHeight.get("height"));
			}
			else {
				this.scrollHeight.set("pageName", "");
				this.scrollHeight.set("height", "");
			}
		}
	},
	
	saveHeight: function() {
		this.scrollHeight.set("pageName", this.pageName);
		this.scrollHeight.set("height", window.getScrollTop());
	}
}

var timeOut = {

	init : function() {
		this.fixElements = $$(".fixed");
		this.fixElements.each(function(element) {
			var top = element.getStyle("top");
			var position = top.substring(0, top.length - 2);
			element.setProperty("originalPosition", position);
			element.setStyle("position", "relative");
		});
		if(this.fixElements.length > 0)
			this.setTimeOut();
	},

	action : function() {
		this.fixElements.each(function(element) {
			var position = element.getProperty("originalPosition");
			position = parseFloat(position);
			if(window.getScrollTop() > position)  {

				position = window.getScrollTop() - position;
				element.setStyle("top", position + "px");
			}
			else 
				element.setStyle("top", "0");
		});
		this.setTimeOut();
	},
	
	setTimeOut : function() {
		window.setTimeout("timeOut.action()", 500);
	}
}