//section edit
var copy = function (arr) {
    var array = new Array();
    for(var i = 0; i < arr.length; i++) {
        array.push(arr[i]);
    }
    return array;
}

function creoleShowEditLinks(pageName, editURL, sectionEdit) {
	if(!sectionEdit)
		sectionEdit = "Bearbeiten";
    if( !$("previewcontent")) {
        var index=0;
        $$('#pagecontent *[id^=section-' + pageName + '-]').each(function(node) {
            var div = document.createElement('span');
            var editLink= editURL + "&section="+index+"&name="+node.getAttribute("id");
            index++;
            var link = document.createElement('a');
            link.setAttribute('href', editLink);
            var children = node.childNodes;
            var oldChildren = copy(children);
            for(var i = 0; i < children.length; i++) {
                node.removeChild(children[i]);
            }
            div.setAttribute('class', 'sectionedit');
            div.appendChild(document.createTextNode("["));
            var myText = document.createTextNode(sectionEdit);
            link.appendChild(myText);
            node.appendChild(div);
            div.appendChild(link);
            div.appendChild(document.createTextNode("]"));
            for(var i = 0; i < oldChildren.length; i++) {
                var sectionSpan = document.createElement('span');
                sectionSpan.appendChild(oldChildren[i]);
                node.appendChild(sectionSpan);
            }
        
        });
    }
}