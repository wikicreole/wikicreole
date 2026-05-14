var SearchUtil = {

	setInactiveTabClick: function(nextSearchTab, queryElement, beforeClick, fromNormal) {
		nextSearchTab.addEvent("click", function() {
			if(beforeClick)
				beforeClick();
			var query = queryElement.value;
			var href = nextSearchTab.getProperty("href");
			href += "?";
			if(fromNormal)
				href += "advancedclick=true&";
			href += "query=" + query;
			nextSearchTab.setProperty("href", href);
		});
	}

};

var search = {};

search.Matcher = (function() {

	 function Matcher(regex, text, flags) {
         if(flags === undefined || flags === null)
            flags = "";

        this.text = text;
        this.pattern = new RegExp(regex, "g" + flags);
        this.previousMatchEnd = 0;
        this.replaceText = "";
    };
	
	Matcher.prototype = {
    
		find: function() {
			this.match = this.pattern.exec(this.text);
			return this.match != null;
		},
		
		group: function(group) {
			return this.match[group];
		},
		
		start: function() {
			return this.match.index;
		},
		
		end: function() {
			return this.start() + this.group(0).length;
		},
		
		replace: function(replacement) {
			this.replaceText += this.text.substring(this.previousMatchEnd, this.start()) + replacement;
			this.previousMatchEnd = this.end();
		},
		
		appendTail: function() {
			this.replaceText += this.text.substring(this.previousMatchEnd, this.text.length);
		},
		
		getText: function() {
			return this.replaceText;
		}
	};
	return Matcher;

}());

search.QueryModel = (function() {

	var escapeChars = [
		"\\+", "\\-", "\\&", "\\|\\|", "\\!", "\\(", "\\)", "\\{", "\\}", "\\[", "\\]", "\\^", "\"", "\\~", "\\*", "\\?", "\\:", "\\\\"
	];
	
	function QueryModel() {
		this.scope = "";
		this.allWords = "";
		this.exactlyTheseWords = "";
		this.orWord1 = "";
		this.orWord2 = "";
		this.orWord3 = "";
		this.notTheseWords = "";
		this.useEscapeSpecialChars = false;
	}
	QueryModel.prototype = {
	
		build: function() {
			var output = "";
			output = this.addToOutput(output, this.getAllWords());
			output = this.addToOutput(output, this.getExactlyTheseWords());
			output = this.addToOutput(output, this.getOrWords());
			output = this.addToOutput(output, this.getNotTheseWords());
			output = this.scope + output;
			return output;
		},
	
		addToOutput: function(output, nextString) {
			if(this.useEscapeSpecialChars)
				nextString = this.escapeSpecialChars(nextString);
			if(output.length > 0)
				output += " ";
			output += nextString;
			return output;
		},
		
		escapeSpecialChars: function(output) {
			escapeChars.forEach(function(escapeChar) {
				var matcher = new search.Matcher(escapeChar, output);
				while(matcher.find()) {
					var match = matcher.group(0);
					matcher.replace("\\" + match);
				}
				matcher.appendTail();
				output = matcher.getText();
			});
			return output;
		},
		
		getOrWords: function() {
			var output = this.orWord1;
			if(output.length > 0 && this.orWord2.length > 0)
				output += " OR ";
			if(this.orWord2.length > 0)
				output += this.orWord2;
			if(output.length > 0 && this.orWord3.length > 0)
				output += " OR ";
			if(this.orWord3.length > 0)
				output += this.orWord3;
			return output;
		},
		
		getAllWords: function() {
			if(this.allWords.length > 0)
				return this.allWords;
			return "";
		},
		
		getExactlyTheseWords: function() {
			if(this.exactlyTheseWords.length > 0)
				return "\"" + this.exactlyTheseWords + "\"";
			return "";
		},
		
		getNotTheseWords: function() {
			if(this.notTheseWords.length > 0) {
				var split = this.notTheseWords.split(" ");
				var output = "";
				split.forEach(function(word, index) {
					if(index > 0)
						output += " ";
					output += "-" + word;
				});
				return output;
			}
			return "";
		}
	};
	return QueryModel;
	
}());

search.QueryBuilder = (function() {

	function QueryBuilder(query, collapseButton, queryModel) {
		this.query = query;
		this.collapseButton = collapseButton;
		this.queryModel = queryModel;
		this.init();
	}
	QueryBuilder.prototype = {
	
		init: function() {
			this.collapseButton.addEvent("click", function() {
				var isOpen = this.isCollapseButtonOpen();
				if(!isOpen)
					this.start();
				else
					this.stop();
			}.bind(this));
			this.setupButtons();
			
			var isOpen = this.isCollapseButtonOpen();
			if(isOpen)
				this.start();
			else
				this.stop();
		},
	
		setQueryFieldDisabled: function(disabled) {
			if(disabled) {
				this.query.setProperty("disabled", "true");
				this.query.setStyle("background", "#C0C0C0");
			} else {
				this.query.setProperty("disabled", "");
				this.query.setStyle("background", "");
			}
		},
		
		isCollapseButtonOpen: function() {
			return this.collapseButton.hasClass("collapseOpen");
		},
		
		setQueryValue: function(value) {
			this.query.value = value;
		},
		
		getQueryValue: function() {
			return this.query.value;
		},
		
		prepareModel: function() {
			var allWords = $("allWords");
			// if(allWords.value.length == 0)
				// allWords.value = this.getQueryValue();
			this.queryModel.scope = $("scope").value;
			var self = this;
			["allWords", "exactlyTheseWords", "notTheseWords", "orWord1", "orWord2", "orWord3"].forEach(function(id) {
				this.queryModel[id] = $(id).value;
				$(id).observe(function() {
					this.queryModel[id] = $(id).value;
					self.setQueryValue(this.queryModel.build());
					this.setQueryFieldDisabled(false);
					SearchBox.runfullsearch(null, function() {
						this.setQueryFieldDisabled(true);
					}.bind(this));
				}.bind(this));
			}.bind(this));
			$("scope").addEvent("change", function() {
				this.queryModel.scope = $("scope").value;
			}.bind(this));
			var queryBuild = this.queryModel.build();
			if(queryBuild.length > 0)
				this.setQueryValue(this.queryModel.build());
			else {
				allWords.value = this.getQueryValue();
				this.queryModel.allWords = this.getQueryValue();
			}
		},
		
		setupButtons: function() {
			["advanced", "details", "scope", "substring"].forEach(function(id) {
				$(id).removeEvents("click");
				$(id).addEvent("click", function() {
					this.setQueryFieldDisabled(false);
					SearchBox.runfullsearch(null, function() {
						if(this.isCollapseButtonOpen())
							this.setQueryFieldDisabled(true);
					}.bind(this));
				}.bind(this));
			}.bind(this));
			["ok", "go"].forEach(function(id) {
				$(id).addEvent("click", function() {
					this.setQueryFieldDisabled(false);
				}.bind(this));
			}.bind(this));
		},
		
		start: function() {
			this.setQueryFieldDisabled(true);
			this.prepareModel();
		},
		
		stop: function() {
			this.setQueryFieldDisabled(false);
		},
	
	};
	return QueryBuilder;
}());