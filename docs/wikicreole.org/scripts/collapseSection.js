/**
*
*  MD5 (Message-Digest Algorithm)
*  http://www.webtoolkit.info/
*
**/
 
var MD5 = function (string) {
 
	function RotateLeft(lValue, iShiftBits) {
		return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
	}
 
	function AddUnsigned(lX,lY) {
		var lX4,lY4,lX8,lY8,lResult;
		lX8 = (lX & 0x80000000);
		lY8 = (lY & 0x80000000);
		lX4 = (lX & 0x40000000);
		lY4 = (lY & 0x40000000);
		lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
		if (lX4 & lY4) {
			return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
		}
		if (lX4 | lY4) {
			if (lResult & 0x40000000) {
				return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
			} else {
				return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
			}
		} else {
			return (lResult ^ lX8 ^ lY8);
		}
 	}
 
 	function F(x,y,z) { return (x & y) | ((~x) & z); }
 	function G(x,y,z) { return (x & z) | (y & (~z)); }
 	function H(x,y,z) { return (x ^ y ^ z); }
	function I(x,y,z) { return (y ^ (x | (~z))); }
 
	function FF(a,b,c,d,x,s,ac) {
		a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
		return AddUnsigned(RotateLeft(a, s), b);
	};
 
	function GG(a,b,c,d,x,s,ac) {
		a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
		return AddUnsigned(RotateLeft(a, s), b);
	};
 
	function HH(a,b,c,d,x,s,ac) {
		a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
		return AddUnsigned(RotateLeft(a, s), b);
	};
 
	function II(a,b,c,d,x,s,ac) {
		a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
		return AddUnsigned(RotateLeft(a, s), b);
	};
 
	function ConvertToWordArray(string) {
		var lWordCount;
		var lMessageLength = string.length;
		var lNumberOfWords_temp1=lMessageLength + 8;
		var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
		var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
		var lWordArray=Array(lNumberOfWords-1);
		var lBytePosition = 0;
		var lByteCount = 0;
		while ( lByteCount < lMessageLength ) {
			lWordCount = (lByteCount-(lByteCount % 4))/4;
			lBytePosition = (lByteCount % 4)*8;
			lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));
			lByteCount++;
		}
		lWordCount = (lByteCount-(lByteCount % 4))/4;
		lBytePosition = (lByteCount % 4)*8;
		lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
		lWordArray[lNumberOfWords-2] = lMessageLength<<3;
		lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
		return lWordArray;
	};
 
	function WordToHex(lValue) {
		var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
		for (lCount = 0;lCount<=3;lCount++) {
			lByte = (lValue>>>(lCount*8)) & 255;
			WordToHexValue_temp = "0" + lByte.toString(16);
			WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
		}
		return WordToHexValue;
	};
 
	function Utf8Encode(string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";
 
		for (var n = 0; n < string.length; n++) {
 
			var c = string.charCodeAt(n);
 
			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
 
		}
 
		return utftext;
	};
 
	var x=Array();
	var k,AA,BB,CC,DD,a,b,c,d;
	var S11=7, S12=12, S13=17, S14=22;
	var S21=5, S22=9 , S23=14, S24=20;
	var S31=4, S32=11, S33=16, S34=23;
	var S41=6, S42=10, S43=15, S44=21;
 
	string = Utf8Encode(string);
 
	x = ConvertToWordArray(string);
 
	a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
 
	for (k=0;k<x.length;k+=16) {
		AA=a; BB=b; CC=c; DD=d;
		a=FF(a,b,c,d,x[k+0], S11,0xD76AA478);
		d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
		c=FF(c,d,a,b,x[k+2], S13,0x242070DB);
		b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
		a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
		d=FF(d,a,b,c,x[k+5], S12,0x4787C62A);
		c=FF(c,d,a,b,x[k+6], S13,0xA8304613);
		b=FF(b,c,d,a,x[k+7], S14,0xFD469501);
		a=FF(a,b,c,d,x[k+8], S11,0x698098D8);
		d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
		c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
		b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
		a=FF(a,b,c,d,x[k+12],S11,0x6B901122);
		d=FF(d,a,b,c,x[k+13],S12,0xFD987193);
		c=FF(c,d,a,b,x[k+14],S13,0xA679438E);
		b=FF(b,c,d,a,x[k+15],S14,0x49B40821);
		a=GG(a,b,c,d,x[k+1], S21,0xF61E2562);
		d=GG(d,a,b,c,x[k+6], S22,0xC040B340);
		c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);
		b=GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
		a=GG(a,b,c,d,x[k+5], S21,0xD62F105D);
		d=GG(d,a,b,c,x[k+10],S22,0x2441453);
		c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
		b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
		a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
		d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);
		c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
		b=GG(b,c,d,a,x[k+8], S24,0x455A14ED);
		a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
		d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
		c=GG(c,d,a,b,x[k+7], S23,0x676F02D9);
		b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
		a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
		d=HH(d,a,b,c,x[k+8], S32,0x8771F681);
		c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
		b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
		a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
		d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
		c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
		b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
		a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
		d=HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
		c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
		b=HH(b,c,d,a,x[k+6], S34,0x4881D05);
		a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
		d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
		c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
		b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
		a=II(a,b,c,d,x[k+0], S41,0xF4292244);
		d=II(d,a,b,c,x[k+7], S42,0x432AFF97);
		c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);
		b=II(b,c,d,a,x[k+5], S44,0xFC93A039);
		a=II(a,b,c,d,x[k+12],S41,0x655B59C3);
		d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
		c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
		b=II(b,c,d,a,x[k+1], S44,0x85845DD1);
		a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
		d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
		c=II(c,d,a,b,x[k+6], S43,0xA3014314);
		b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);
		a=II(a,b,c,d,x[k+4], S41,0xF7537E82);
		d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);
		c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
		b=II(b,c,d,a,x[k+9], S44,0xEB86D391);
		a=AddUnsigned(a,AA);
		b=AddUnsigned(b,BB);
		c=AddUnsigned(c,CC);
		d=AddUnsigned(d,DD);
	}
 
	var temp = WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);
 
	return temp.toLowerCase();
}


// Uses a hash cookie to store the ids of the sections to hide.
// The autoSave means that every time a method is called on cookie, the result
// will be saved automatically. The duration is the live time of the cookie measured in days.

var collapseSectionPageName = $$("meta[name=wikiPageName]").getProperty("content")[0];
var collapseSectionApplicationName = $$("meta[name=wikiApplicationName]").getProperty("content")[0];
var cookieName = 'juwiCookie_' + MD5(collapseSectionApplicationName + collapseSectionPageName);
var cookie = new Hash.Cookie(cookieName, {duration: 30, autoSave : true});
var cookie;

var collapseSectionCommentBoxes;
var collapseSectionCommentBox = true;

var commentBoxCollapseHash = new Hash();
var collapseHash = new Hash();

function initCollapseSection() 
{    
	collapseSectionIE7Firefox3Fix();
    var browserName = navigator.appName; 
    
    if(browserName.indexOf("Microsoft") > -1 )
    {
        //this is a goddamn ie... don't load FX.Slide for now and
        $$('.collapseSectionContainer').each(function (element, index)
        {
			/* if(index == 0)
				addCollapseAllSectionsButton(element);
            //somehow the container elements are not displayed properly.
             addToggleEvent(element, cookie);  */
        });
    }
    else
    {
		window.addEvent('resize', function() {
			clearCollapseSectionHeights();
			//initCollapseSection();
		});
        /* $$('.collapseSectionContainer').each(function (element, index)
        {
			if(index == 0)
				addCollapseAllSectionsButton(element);
            addToggleEvent(element, cookie);  
        }); */
    }
	cookie.load();
	
	//alert($$('.collapseSectionContainer').length);
	collapseSectionCommentBoxes = $$('.commentbox .collapseSectionContainer');
	collapseSectionCommentBoxes.each(function(element, index) {
		if(index == 0)
			addCollapseAllSectionsButton(element, commentBoxCollapseHash);
		addToggleEvent(element, cookie, commentBoxCollapseHash);
	});
	var addedCollapseAll = false;
	$$('.collapseSectionContainer').each(function(element, index) {
		if(!addedCollapseAll && !collapseSectionCommentBoxes.contains(element))
		{
			addCollapseAllSectionsButton(element, collapseHash);
			addedCollapseAll = true;
		}
		addToggleEvent(element, cookie, collapseHash);
	});
	//alert($("pagecontent").getElements(".collapseSectionContainer").length);
	//$("pagecontent").getElements(".collapseSectionContainer").each(realInitCollapseSection);
}

function collapseSectionIE7Firefox3Fix() {
	if(navigator.appVersion.indexOf("MSIE 7.")!=-1 || navigator.appVersion.indexOf("MSIE 6.")!=-1 || navigator.userAgent.indexOf("Firefox/3.0")!=-1)
	{
		$$("div[id^=collapseSection_icon]").each(function(element)
		{
			var parent = element.getParent();
			var children = element.getChildren();
			children.injectTop(element);
			parent.wrap(children);
			element.empty();
		});
		if(navigator.userAgent.indexOf("Firefox/3.0")!=-1) 
		{
			$$("div.collapseSectionIconOpen, div.collapseSectionIconClosed").each(function(element)
			{
				element.setStyles({
				   "width": '25px',
				   "float": 'left'
				});
			});
			$$(".collapseSection-h2").each(function(element)
			{
				element.setStyle("display", "inline-block");
			});
		}
	}
}

function realInitCollapseSection(element, index)
{
	if(index == 0)
		addCollapseAllSectionsButton(element);
    addToggleEvent(element, cookie);
}

function addCollapseAllSectionsButton(section, hash)
{
	var h2 = section.getElement("div[class=collapseSection-h2]");
	var collapse = new Element("span",
	{
		'class': 'collapseSectionToggle',
		'events':
		{
			'click': function()
			{
				hideAllCollapseSections(hash);
			}
		}
	});
	collapse.setText("-");
	
	var expand = new Element("span",
	{
		'class': 'collapseSectionToggle',
		'events':
		{
			'click': function()
			{
				showAllCollapseSections(hash);
			}
		}
	});
	var separator = new Element("div", { "class" : "sectionButtonSeparator" } );
	expand.setText("+");
	if(navigator.appVersion.indexOf("MSIE 7.")!=-1 || navigator.appVersion.indexOf("MSIE 6.")!=-1 || navigator.userAgent.indexOf("Firefox/3.0")!=-1)
	{
		collapse.injectBefore(h2);
		expand.injectBefore(h2);
		separator.injectBefore(h2);
	}
	else
	{
		h2.appendChild(collapse);
		h2.appendChild(expand);
		h2.appendChild(separator);
	}
}

function clearCollapseSectionHeights() {
	/* $$('.collapseSectionContainer').each(function (element) {
		var sectionIdName = element.id;
		var section = $('collapseSection_slide-'+sectionIdName);
		var wrapper = section.getParent();
		var oldHeight = wrapper.getStyle('height');
		section.setStyle('height', 'auto');
		wrapper.setStyle('height', '');
		wrapper.setProperty('originalheight', wrapper.getStyle('height'));
		if(oldHeight =='0px') {
			section.setStyle('height', section.getParent().getStyle('height'));
			wrapper.setStyle('height', '0px');
		}
		console.log(wrapper.getProperty('originalheight'));
	}); */
	
	$$('.collapseSectionContainer').each(function (element) {
		clearHeightOfCollapseSection(element);
	});
}

function clearHeightOfCollapseSection(element)
{
	var sectionIdName = element.id;
	var section = $('collapseSection_slide-'+sectionIdName);
	var wrapper = section.getParent();
	var slide = collapseHash.get(sectionIdName);
	if(wrapper.getStyle('height') == '0px') 
	{
		if(slide)
		{
			slide.show();
			slide.hide();
		}
	}
	else 
	{
		if(slide) {
			slide.hide();
			slide.show();
		}
	}
}

function addToggleEvent(el, cookie, hash)
{
	
    var sectionIdName = el.id;
    
    //we have three id elements that are important for the slide animation
    //* collapseSection_toggle-@id@, which is the header
    //* collapseSection_slide-@id@, which is the content
    //* collapseSection_footer-@id@, which is actually the footer

    /*mootools.js 1.11*/
    
	// body of the collapse section that will be hidden/shown
	var section = $('collapseSection_slide-'+sectionIdName);
	var wrapper = section.getParent();
	
	var initializing = !wrapper.hasClass('fxwrapper');
	
	if(initializing) {
		var collapseSectionSlide = new Fx.Slide('collapseSection_slide-'+sectionIdName, {duration: 100});
		hash.set(sectionIdName, collapseSectionSlide);
		wrapper = collapseSectionSlide.wrapper;
		wrapper.addClass('fxwrapper');
	}
	
	// height of the Fx.Slide wrapper around the section that has the correct height
	var height = wrapper.getStyle('height');
    
	if(initializing) {
		var useHash = hash;
		$("collapseSection_toggle-"+sectionIdName).addEvent("click", function(e)
		{
		
			var event = new Event(e);
			
			// reduces the height of the section by 20 pixel to counter the offset that the Fx.Slide calculates
			// on top of the height
			
		/*	// height of section that has the correct height
			var height = section.getStyle('height');
			// parses the height pixel as an integer
			var heightNum = height.substring(0, height.length - 2);
			var heightNum = heightNum.toFloat();
			if(!collapseSectionSlide.open)
				section.setStyle('height', (heightNum - 21.0) + 'px'); */
			
			if(event.target.nodeName.toLowerCase() == 'a') 
            {
				event.target.onClick();
				return false;
			}
			else
            {
               try { if(event.target.hasClass("collapseSectionToggle")) return false; } catch (e) {}
            }
			if(event.target.id.indexOf("section") == 0 || event.target.getProperty("id").indexOf("section") == 0) 
			{
				collapseSectionSlide.toggle();
				event.stop();
				// When the cookie set function is called, the open status of the collapseSectionSlide is still
				// in the old state, so it has to be negated.
				setCollapseSectionCookie(sectionIdName, !collapseSectionSlide.open, cookie);
			}
			else 
			{
				hideAllCollapseSections(useHash, collapseSectionSlide);
			}
		}); 
		
		collapseSectionSlide.addEvent('onComplete', function() 
		{
		
			var isOpen = collapseSectionSlide.open;
			
			// sets the height of the section to the intended height after the Fx is finished
		/*	var height = wrapper.getProperty('originalheight');
			if(isOpen)
				section.setStyle('height', height);
			*/
			setCollapseSectionOpen(sectionIdName, isOpen, collapseSectionSlide);
			
			if(isOpen)
			{
				collapseSectionSlide.wrapper.setStyle("height", "");
			}
		});
	}
    
    // initializes the wrapper and the section with the correct height, to ensure correct CSS interpretation
/*	wrapper.setStyle('height', height);
	wrapper.setProperty('originalheight', wrapper.getStyle('height'));
	if(height != '0px')
		section.setStyle('height', height); */
	var hash = MD5(sectionIdName);
    setCollapseSectionOpen(sectionIdName, !cookie.hasKey(hash), collapseSectionSlide);
}

/**
 * Sets the hash cookie depending on whether the section is open or closed and the corresponding 
 * key/value pair in the cookie exists.
 * 
 * @param sectionIdName id name of the section
 * @param isOpen status of the section
 * @param cookie cookie with hash values
 */
function setCollapseSectionCookie(sectionIdName, isOpen, cookie)
{
	// checks if the sectionIdName is present in the cookie, which would mean that from a cookie
	// point of view the section should be closed
	var hash = MD5(sectionIdName);
	var cookieExists = cookie.hasKey(hash);
	// if the cookie says it is closed but the section is now open, the key has to be removed
	if(cookieExists && isOpen)
    {
		cookie.remove(hash);
	}
	else
    {
        // if the key doesn't exist but the section is now closed, a key needs to be set, in this case
        // with an empty value, because we don't need it
        if(!cookieExists && !isOpen) cookie.set(hash, '');
    }
}

function setCollapseSectionOpen(sectionIdName, isOpen, collapseSectionSlide)
{
	// If collapseSectionSlide is not null it means that this function is called during startup.
	// If the section is not open, the section is hidden.
	 if(collapseSectionSlide && !isOpen) 
     {
    	 collapseSectionSlide.hide();
		 collapseSectionSlide.wrapper.addClass("closed");
		 var content = collapseSectionSlide.wrapper.getFirst();
		 if(content.hasClass('closed'))
			 content.removeClass('closed');
     }
	 else if(collapseSectionSlide && isOpen) {
		if(collapseSectionSlide.wrapper.hasClass("closed"))
			collapseSectionSlide.wrapper.removeClass("closed");
	 }
     
    if(isOpen)
     {
         $('collapseSection_toggle-'+sectionIdName).setProperty('class','collapseSectionHeaderOpen');
         $('collapseSection_icon-'+sectionIdName).setProperty('class','collapseSectionIconOpen');
         $('collapseSection_bottom-'+sectionIdName).setProperty('class','collapseSectionBottomOpen');
     }
     else
     {
         $('collapseSection_toggle-'+sectionIdName).setProperty('class','collapseSectionHeaderClosed');
         $('collapseSection_icon-'+sectionIdName).setProperty('class','collapseSectionIconClosed');
         $('collapseSection_bottom-'+sectionIdName).setProperty('class','collapseSectionBottomClosed');
     }
}

function showAllCollapseSections(hash)
{
	hash.keys().each(function(sectionIdName) {
		var slide = hash.get(sectionIdName);
		slide.slideIn();
		setCollapseSectionCookie(sectionIdName, true, cookie);
	});
}

function hideAllCollapseSections(hash, exceptThisSlide)
{
	hash.keys().each(function(sectionIdName) {
		var slide = hash.get(sectionIdName);
		if(exceptThisSlide != slide) {
			slide.slideOut();
			setCollapseSectionCookie(sectionIdName, false, cookie);
		}
		else {
			if(!slide.open) {
				slide.slideIn();
				setCollapseSectionCookie(sectionIdName, true, cookie);
			}
			else {
				slide.slideOut();
				setCollapseSectionCookie(sectionIdName, false, cookie);
			}
		}
	});
}


/**
* This handler resizes the collapse section when clicking on a tabbed section.
*/
var CollapseSectionTabHandler =
{
	render: function(page, name)
	{
		if(name != "Favorites")
		{
			if(navigator.appVersion.indexOf("MSIE 7.")==-1) {
				$$('.collapseSectionContainer').each(function (element)
				{
					element.getElements("a[id^=menu-tab-]").each(function(link) 
					{	
						var slide = collapseHash.get(element.id);
						link.addEvent('click', function(e)
						{
							slide.hide();
							slide.show();
						});
					});
				});
			}
		}
	}
}

Wiki.addPageRender(CollapseSectionTabHandler);