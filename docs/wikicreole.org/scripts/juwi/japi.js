var Japi = 
{
    jsonid: 10000,
    
    onLoadCallbacks: [],
    
    init: function()
    {
        Japi.jsonUrl = Japi.metaContent("wikiJsonUrl");
        Japi.baseUrl = Japi.metaContent("wikiBaseUrl");
        Japi.pageName = Japi.metaContent("wikiPageName");
        Japi.pageUrl = Japi.metaContent("wikiPageUrl");
        Japi.userName = Japi.metaContent("wikiUserName");
        Japi.forEach(Japi.onLoadCallbacks, function(callback) {
            callback();
        });
    },
    
    initWhenReady: function()
    {
        jQuery(document).ready(Japi.init());
    },
    
    onLoad: function(callback, context)
    {
        //callback = this.bindThis(callback, context);
        this.onLoadCallbacks.push(callback);
        //jQuery(document).ready(callback);
    },
    
    slice: function(array, start, end)
    {
        return jQuery(array).slice(start, end);
    },
    
    bindThis: function(functionToBind, context)
    {
        return jQuery.proxy(functionToBind, context);
    },
    
    byId: function(id)
    {
        return jQuery("#" + id);
    },
    
    query: function(selector)
    {
        return jQuery(selector);
    },
    
    bindKeyEvent: function(element, callback, context)
    {
        callback = this.bindThis(callback, context);
        jQuery(element).bind( "keyup", function(event, ui) {
            var element = jQuery(event.currentTarget);
            var value = element.val();
            callback(value);
        });
    },
    
    bindOnKeyDown: function(element, callback, context)
    {
    	callback = this.bindThis(callback, context);
    	jQuery(element).bind( "keyup", function(event, ui) {
    		callback(event);
    	});
    },
    
    bindOnClick: function(element, callback, context)
    {
        callback = this.bindThis(callback, context, Japi.slice(arguments, 3));
        jQuery(element).click(callback);
    },
    
    click: function(element)
    {
        jQuery(element).trigger("click");
    },
    
    metaContent: function(name)
    {
        return jQuery('meta[name=' + name + ']').attr("content");
    },
    
    ajax: function(url, callback, type, context)
    {
        if(type == undefined)
        {
            type = "post";
        }
        callback = this.bindThis(callback, context, Japi.slice(arguments, 4));
        jQuery.ajax({
            url: url,
            type: type,
            success: callback
        });
    },

    jsonCall: function(method, params, callback, context) 
    {
        callback = this.bindThis(callback, context, Japi.slice(arguments, 4));
        jQuery.ajax({
            url: this.jsonUrl,
            type: "post",
            data: Japi.toJSON( { "id": this.jsonid++, "method": method, "params": params } ),
            success: function(response, textStatus, jqXHR){
                response = Japi.parseJSON(response);
                if(response.result)
                {
                    callback(response.result);
                }
                else
                {
                    callback(response);
                }
            }
        } );
    },
    
    remoteJsonCall: function(url, method, params, callback, errorCallback, context) 
    {
        callback = this.bindThis(callback, context, Japi.slice(arguments, 5));
        errorCallback = this.bindThis(errorCallback, context, Japi.slice(arguments, 5));
        this.remoteLogin(url, function()
        {
            url += "/JSON-RPC";
            jQuery.ajax({
                url: url,
                xhrFields: {
                    withCredentials: true
                },
                 beforeSend: function(xhr){
                    xhr.withCredentials = true;
                },
                crossDomain: true,
                type: "post",
                data: Japi.toJSON( { "id": Japi.jsonid++, "method": method, "params": params } ),
                success: function(response, textStatus, jqXHR){
                    response = Japi.parseJSON(response);
                    if(response.result)
                    {
                        callback(response.result);
                    }
                    else
                    {
                        callback(response);
                    }
                },
                error: function(jqXHR, textStatus, errorThrown )
                {
                    // console.log(textStatus + ", " + errorThrown);
                }
            });
        }, errorCallback);
    },
    
    remoteLogin: function(url, callback, errorCallback)
    {
        url += "/json";
        Japi.remoteLoginTest(url, function(result)
        {
            if(result == "authenticated")
            {
                callback();
            }
            else
            {
                Japi.remoteLoginTest(result, function(url2)
                {
                    Japi.remoteLoginTest(url2, function(loginResult)
                    {
                        if(loginResult == "true")
                        {
                            callback();
                        }
                        else
                        {
                            errorCallback();
                        }
                    });
                });
            }
        });
    },
    
    remoteLoginTest: function(url, callback) 
    {
        jQuery.ajax({
            url: url,
            xhrFields: {
                withCredentials: true
            },
             beforeSend: function(xhr){
                xhr.withCredentials = true;
            },
            data: "ajax=true",
            crossDomain: true,
            type: "get",
            success: function(response, textStatus, jqXHR){
                callback(response);
            },
            error: function(jqXHR, textStatus, errorThrown )
            {
                // console.log(jqXHR);
                // console.log(jqXHR.getResponseHeader("Server"));
                // console.log(jqXHR.getAllResponseHeaders());
                // console.log(textStatus + ", " + errorThrown);
            }
        });
    },
    
    translateWikiCode: function(code, callback, context)
    {
        callback = this.bindThis(callback, context, Japi.slice(arguments, 3));
        code = Japi.encodeUri(code);
        this.jsonCall("pageRequester.translateWikiCode", [code], callback);
    },
    
    encodeUri: function(text)
    {
        return encodeURIComponent(text);
    },
    
    parseJSON: function(json)
    {
        return jQuery.parseJSON( json );
    },
    
    toJSON: function(object)
    {
        return JSON.stringify(object);
    },
    
    getHtml: function(element)
    {
        return jQuery(element).html();
    },
    
    setHtml: function(element, htmlText)
    {
        jQuery(element).html(htmlText);
    },
    
    forEach: function(list, callback, context)
    {
        callback = this.bindThis(callback, context, Japi.slice(arguments, 3));
        for(var i = 0; i < list.length; i++)
        {
            var element = list[i];
            var result = callback(element, i);
            if(result === false)
            {
                break;
            }
        }
    },
    
    forEachProp: function(json, callback, object)
    {
        for(property in json)
        {
            var result;
            if(object)
            {
                result = callback.call(object, property, json[property]);
            }
            else
            {
                result = callback(property, json[property]);
            }
            if(result === false)
            {
                break;
            }
        }
    },
    
    createListView: function(element, listView)
    {
        var view = "<ul data-role='listview' data-inset='true'>\n";
        Japi.forEach(listView, function(item)
        {
            view += "<li>";
            if(item.link)
            {
                view += "<a href='" + Japi.viewUrl(item.link) + "'>";
            } 
            view += item.name;
            if(item.dsc)
            {
                view += "<p>" + item.dsc + "</p>";
            }
            if(item.link)
            {
                view += "</a>";
            }
            view += "</li>\n";
        });
        view += "</ul>\n";
        Japi.empty(element);
        Japi.setHtml(element, view);
    },
    
    empty: function(element)
    {
        jQuery(element).empty();
    },
    
    viewUrl: function(page)
    {
        return Japi.pageUrl.replace(/%23%24%25/, page);
    },
    
    createPageLink: function(page)
    {
        return "<a href='" + Japi.viewUrl(page) + "'>" + page + "</a>";
    },
    
    bindToToggle: function(element, callback, context)
    {
        callback = this.bindThis(callback, context, Japi.slice(arguments, 3));
        jQuery(element).on( 'slidestop', function( event ) 
        {  
            var state = event.target.value;
            callback(state == "on");
        });
    },
    
    hasClass: function(element, clazz)
    {
        return jQuery(element).hasClass(clazz);
    },
    
    addClass: function(element, clazz)
    {
        jQuery(element).addClass(clazz);
    },
    
    removeClass: function(element, clazz)
    {
        jQuery(element).removeClass(clazz);
    },
    
    getAttribute: function(element, attribute)
    {
        var value = jQuery(element).attr(attribute);
        if(value == undefined)
        {
            value = element[attribute];
        }
        return value;
    },
    
    setAttribute: function(element, attribute, value)
    {
        jQuery(element).attr(attribute, value);
    },
    
    removeAttribute: function(element, attribute)
    {
        jQuery(element).removeAttr(attribute);
    },
    
    setCookie: function(name, value, expires, path)
    {
        if(!expires)
        {
            expires = 7;
        }
        var extra_values = { expires: expires };
        if(path)
        {
            extra_values.path = path;
        }
        jQuery.cookie(name, value, extra_values);
    },
    
    setPermanentCookie: function(name, value)
    {
        jQuery.cookie(name, value);
    },

    getCookie: function(name)
    {
        return jQuery.cookie(name);
    },
    
    removeCookie: function(name, path)
    {
        if(path != undefined)
        {
            jQuery.removeCookie(name, { path: path });
            return;
        }
        jQuery.removeCookie(name);
    },
    
    redirectAsALink: function(url)
    {
        window.location.href = url;
    },
    
    getCurrentUrl: function(url)
    {
        return window.location.href;
    },
    
    reloadPage: function()
    {
        window.location.reload();
    },
    
    queryInsideElement: function(element, query)
    {
        return jQuery(element).find(query);
    },
    
    getInsideElement: function(element, query)
    {
        var result = Japi.queryInsideElement(element, query);
        if(result.length > 0)
        {
            return result[0];
        }
        return null;
    },
    
    replaceWith: function(element, replacement)
    {
        jQuery(element).replaceWith(replacement);
    },
    
    replaceWithHtml: function(element, replacement)
    {
        jQuery(element).replaceWith(replacement);
    },
    
    valueOfInput: function(element)
    {
        return jQuery(element).val();
    },
    
    previousSibling: function(element)
    {
        return jQuery(element).prev()[0];
    },
    
    nextSibling: function(element)
    {
        return jQuery(element).next();
    },
    
    getParent: function(element)
    {
        return jQuery(element).parent()[0];
    },
    
    getText: function(element)
    {
        return jQuery(element).text();
    },
    
    appendChild: function(element, child)
    {
        jQuery(element).append(jQuery(child));
    },
    
    appendChildAtTop: function(element, child)
    {
        jQuery(element).prepend(jQuery(child));
    },
    
    appendChildAtIndex: function(element, newChild, indexToAppend)
    {
        newChild = jQuery(newChild);
        var wasAppended = false
        Japi.forEach(Japi.getChildren(element), function(child, index)
        {
            if(index == indexToAppend)
            {
                jQuery(child).before(newChild);
                wasAppended = true;
                return false;
            }
        });
        if(!wasAppended)
        {
            Japi.appendChild(element, newChild);
        }
    },
    
    appendChildAfterElement: function(elementAfter, child)
    {
        jQuery(elementAfter).after(jQuery(child));
    },
    
    getIndexOfElement: function(element)
    {
        return jQuery(element).index();
    },
    
    getChildren: function(element)
    {
        return jQuery(element).children();
    },
    
    createElementFromHtml: function(html)
    {
        return jQuery(html);
    },
    
    setStyle: function(element, key, value)
    {
        jQuery(element).css(key, value);
    },
    
    getStyle: function(element, key)
    {
        return jQuery(element).css(key);
    },
    
    stopPropagation: function(event)
    {
        event.stopPropagation();
        event.stopImmediatePropagation();
    },
    
    /**
     * Removes the given element completely from the DOM, also destroying
     * all events.
     */
    removeFromDom: function(element)
    {
        jQuery(element).remove();
    },
    
    /**
     * Only removes the element from its parent without destroying events.
     */
    detachFromParent: function(element)
    {
        jQuery(element).detach();
    },
    
    parseInt: function(string)
    {
        return parseInt(string);
    },
    
    getRows: function(table)
    {
        return Japi.queryInsideElement(jQuery(table), "tr");
    },
    
    getTag: function(element)
    {
        return Japi.getAttribute(element, "tagName").toLowerCase();
    },
    
    checkboxChecked: function(checkbox)
    {
        return Japi.getAttribute(checkbox, "checked");
    },
    
    copyJSON: function(original)
    {
        var json = { };
        Japi.forEachProp(original, function(key, value)
        {
            json[key] = value;
        });
        return json;
    }
}
