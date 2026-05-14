jQuery(document).ready(function($){
   $("#ulSelectColumn").clickMenu();
   TableArrange.init();
   TableSelect.init();
   
   var fancyboxParams = {
        'titlePosition' : 'inside',
        'titleFormat'       : function(title, currentArray, currentIndex, currentOpts) {
            if(title.trim().length == 0)
                title = "&nbsp;";
            var span = "<span><span style='float:right; font-weight:bold;'>(" + (currentIndex + 1) + "/" + currentArray.length + ")</span>";
            span += title + "</span>";
            return span;
        },
        'cyclic': true
    };
   
   jQuery('.ipro.fancybox a').fancybox(fancyboxParams);
   
   jQuery(".gallerybox").each(function(index, gallerybox) {
        jQuery(gallerybox).find(".ipro a").each(function(i, link) {
            if(jQuery(link).parent().next()[0] == undefined)
            {
                return;
            }
            var title = jQuery(link).parent().next()[0].clone();
            jQuery(title).children()[0].remove();
            fancyboxParams.title = jQuery(title).html();
            jQuery(link).children().attr("rel", "fancyscript" + index);
            jQuery(link).attr("rel", "fancyscript" + index);
            jQuery(link).fancybox(fancyboxParams);
        });
        jQuery(gallerybox).find("img").each(function(i, image) {
            if(!jQuery(image).attr("rel") && jQuery(image).attr("src").indexOf("images/attachment_small.png") == -1 && jQuery(image).attr("class") != "imagepro_magnify") {
                var parent = Japi.getParent(image);
                if(Japi.getTag(parent) != 'a') {
                    var link = "<a href='" + jQuery(image).attr("src") + "' rel='fancyscript" + index + "'/>";
                    jQuery(image).wrap(link);
                    fancyboxParams.title = "";
                    jQuery(image).parent().fancybox(fancyboxParams);
                }
                else {
                    var href = jQuery(parent).attr("href");
                    var title = jQuery(image).attr("title");
					var firstChild = jQuery(parent).parent().parent().parent().parent().children()[0];
					if (typeof firstChild != "undefined" && typeof firstChild.attr != "undefined")
					{
						if (firstChild.attr("nodeName").toLowerCase() == "caption")
							title = jQuery(jQuery(parent).parent().parent().parent().parent().children()[0]).attr("innerHTML");
					}
                    fancyboxParams.title = title + " <a href='" + href + "'>" + href + "</a>";
                    jQuery(parent).attr("href", jQuery(image).attr("src"));
                    jQuery(parent).attr("rel", "fancyscript" + index);
                    jQuery(parent).fancybox(fancyboxParams);
                    fancyboxParams.title = "";
                }
            }
        });
   });
});
