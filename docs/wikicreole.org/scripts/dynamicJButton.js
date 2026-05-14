/*this is necessary because of accessing JuwiForm via IE
  Important: it has to be executed before the first JuwiForm tag
  appears on the page.
*/
Element.extend({

    JuwiForm: document.getElementById("JuwiForm")

}); 

function initDynamicJButton() 
{
	$$('.jbtn-dynamic-container, .jbtn-dynamic-state-container, .jbtn-icon-container, .jbtn-dynamicicon-container, .jbtn-section-dynamic-container, .jbtn-section-dynamic-state-container, .jbtn-section-dynamicicon-container, .jbtn-table-dynamic-container, .jbtn-form-dynamic-container').each(function (node)
    {
		//node.setProperty('onmouseover', 'jbtnOnMouseOver(this);'+node.getProperty('onmouseover'));
		//node.setProperty('onmouseout', 'jbtnOnMouseOut(this);'+node.getProperty('onmouseout'));
		node.addEvent("mouseover", function() {jbtnOnMouseOver(node)});
		node.addEvent("mouseout", function() {jbtnOnMouseOut(node)});
	});
    
   /* deprecated: we use the above function 
    $$('.jbtn-icon-container').each(function (node)
    {
		node.setProperty('onmouseover', 'jbtnOnMouseOver(this);'+node.getProperty('onmouseover'));
		node.setProperty('onmouseout', 'jbtnOnMouseOut(this);'+node.getProperty('onmouseout'));
	});
    
    $$('.jbtn-dynamicicon-container').each(function (node)
    {
		node.setProperty('onmouseover', 'jbtnOnMouseOver(this);'+node.getProperty('onmouseover'));
		node.setProperty('onmouseout', 'jbtnOnMouseOut(this);'+node.getProperty('onmouseout'));
	});
    
    $$('.jbtn-section-dynamic-container').each(function (node)
    {
		node.setProperty('onmouseover', 'jbtnOnMouseOver(this);'+node.getProperty('onmouseover'));
		node.setProperty('onmouseout', 'jbtnOnMouseOut(this);'+node.getProperty('onmouseout'));
	});
    
    $$('.jbtn-section-dynamicicon-container').each(function (node)
    {
		node.setProperty('onmouseover', 'jbtnOnMouseOver(this);'+node.getProperty('onmouseover'));
		node.setProperty('onmouseout', 'jbtnOnMouseOut(this);'+node.getProperty('onmouseout'));
	});
    
    $$('.jbtn-table-dynamic-container').each(function (node)
    {
		node.setProperty('onmouseover', 'jbtnOnMouseOver(this);'+node.getProperty('onmouseover'));
		node.setProperty('onmouseout', 'jbtnOnMouseOut(this);'+node.getProperty('onmouseout'));
	});
    
    $$('.jbtn-form-dynamic-container').each(function (node)
    {
		node.setProperty('onmouseover', 'jbtnOnMouseOver(this);'+node.getProperty('onmouseover'));
		node.setProperty('onmouseout', 'jbtnOnMouseOut(this);'+node.getProperty('onmouseout'));
	}); */
    
}


function jbtnOnMouseOver(el) 
{
	el.getChildren().each(function(node) 
    {
		node.setProperty('class', 'hover-' + node.getProperty('class'));
	});
}

function jbtnOnMouseOut(el) 
{
	el.getChildren().each(function(node) 
    {
		var className = node.getProperty('class');
		var newClassName = className.substr(className.indexOf('-')+1);
		node.setProperty('class', newClassName);
	});
}

/*
 * When Juwi sets the buttons to disabled only the styles are changed but the onclick functions remain, so even a
 * disabled button can be clicked. This function goes over the buttons with the disabled style and removes the
 * onclick function.
 */
function jbtnDisable() {

	$$(".jbtn_disabled").each(function(element) {
		element.setProperty("onclick", "");
	});

}

/* this is implemented in Juwi 3.0
document.addEvent('keydown', function(e) {
	var event = new Event(e);
	if(event.code == 13) {
		$$('a[onEnter=true]').each(function(button)
		{
				button.onclick();
		});
	}
});
*/