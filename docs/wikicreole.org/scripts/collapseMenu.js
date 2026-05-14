var collapseMenuCookieNameLeftMenu = 'collapseMenuLeftMenu';
var collapseMenuCookieLeftMenu = new Hash.Cookie(collapseMenuCookieNameLeftMenu, {duration: 30, autoSave : true, path : "/"});

var collapseMenuIndexLeftMenu = 0;


function CreateCollapseMenusLeftMenu()
{
	$$("#favorites .collapsemenu").each(function(collapsemenu)
	{
		collapseMenuIndexLeftMenu = CollapseMenuCreate(collapsemenu, collapseMenuIndexLeftMenu, collapseMenuCookieLeftMenu);
	});
}

var collapseMenuCookieName = 'collapseMenu_' + MD5(document.location.pathname);
var collapseMenuCookie = new Hash.Cookie(collapseMenuCookieName, {duration: 30, autoSave : true});

var collapseMenuIndex = 0;


function CreateCollapseMenus()
{
	$$("#page .collapsemenu").each(function(collapsemenu)
	{
		collapseMenuIndex = CollapseMenuCreate(collapsemenu, collapseMenuIndex, collapseMenuCookie);
	});
}

function CollapseMenuCreate(collapsemenu, index, cookie)
{
	var hash = new Hash();
	var title = collapsemenu.getFirst().getNext();
	collapseMenuAddToggleButtons(title, hash);
	while(title && title.getNext())
	{
		var body = title.getNext();
		var nextTitle = body.getNext();
		var slider = CollapseMenuCreateTitle(title, body, nextTitle, index, cookie, hash);
		hash.set(index, slider);
		title = nextTitle;
		index++;
	}
	return index;
}

function CollapseMenuCreateTitle(title, body, nextTitle, index, cookie, hash)
{
	if(body.getChildren().length > 0) 
	{
		var slider = new Fx.Slide(body, {duration: 50});
		var collapseGraphic = title.getFirst();

		title.addEvent("click", function(e)
		{
			var event = new Event(e);
			if(event.target.nodeName.toLowerCase() == 'a') 
			{
				if(navigator.appName.indexOf("Microsoft") > -1)
					event.target.onClick();
				return false;
			}
			if(event.target.getProperty("class").indexOf("collapse") == 0)
				collapseMenuHideAll(hash, slider);
			else if(!event.target.hasClass("collapseMenuToggle"))
				slider.toggle();
		});
		slider.addEvent('onComplete', function() 
		{
			if(slider.open)
			{
				collapseGraphic.setProperty("class", "collapseOpen");
				if(title.hasClass("closed"))
					title.removeClass("closed");
				if(nextTitle.getTag() == "b" && nextTitle.hasClass("closed"))
					nextTitle.removeClass("closed");
				cookie.set(index, "o");
			}
			else 
			{
				collapseMenuCloseTitle(title, collapseGraphic, nextTitle, index, cookie);
			}
		});
		if(!cookie.hasKey(index))
		{
			slider.hide();
			collapseMenuCloseTitle(title, collapseGraphic, nextTitle, index, cookie);
		}
		return slider;
	}
	else
	{
		title.addClass("empty");
		title.getFirst().remove();
		if(nextTitle && nextTitle.getTag() == "b")
			nextTitle.addClass("closed");
	}
}

function collapseMenuCloseTitle(title, collapseGraphic, nextTitle, index, cookie)
{
	collapseGraphic.setProperty("class", "collapseClose");
	title.addClass("closed");
	if(nextTitle && nextTitle.getTag() == "b")
		nextTitle.addClass("closed");
	if(cookie.hasKey(index))
		cookie.remove(index);
}

function collapseMenuAddToggleButtons(title, hash)
{
	var collapse = new Element("span",
	{
		'class': 'collapseMenuToggle',
		'events':
		{
			'click': function()
			{
				collapseMenuHideAll(hash);
			}
		}
	});
	collapse.setText("-");
	
	var expand = new Element("span",
	{
		'class': 'collapseMenuToggle',
		'events':
		{
			'click': function()
			{
				collapseMenuShowAll(hash);
			}
		}
	});
	expand.setText("+");
	
	if(navigator.appVersion.indexOf("MSIE 7.")!=-1 || navigator.appVersion.indexOf("MSIE 6.")!=-1 || navigator.userAgent.indexOf("Firefox/3.0")!=-1)
	{
		collapse.injectBefore(title);
		expand.injectBefore(title);
	}
	else
	{
		title.appendChild(collapse);
		title.appendChild(expand);
	}
}

function collapseMenuShowAll(hash) {
	hash.values().each(function(slide) {
		if(slide)
			slide.slideIn();
	});
}

function collapseMenuHideAll(hash, exceptSlide) {
	hash.values().each(function(slide) {
		if(slide) {
			if(slide != exceptSlide) {
				slide.slideOut();
			}
			else if(!slide.open)
				slide.slideIn();
			else 
				slide.slideOut();
		}
	}); 
}