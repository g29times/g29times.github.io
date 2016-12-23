/******************************************************************************************************
 *                                             PREVIEW HELPER
 *                          This class attached to the Spime engine on edit mode only
 *                          handles the communication with the editor and adds the resize handlers
 ******************************************************************************************************/

var PreviewHelper = {};



/******************************************************************************************************
 *                                             INIT
 *                          The following function is called once by the spime engine
 ******************************************************************************************************/

PreviewHelper.bindHelperActions = function(){
	PreviewHelper.disableRightClickMenu();
	SpimeEngine.getAllHolders().each(function(){
		currentHolder = $(this);
		PreviewHelper.overrideLinks(currentHolder);
	});
	
	if(typeof XPRSHelper.getParentWindow()["XPRSPreview"] != "undefined"){
		//PreviewHelper.injectPreviewFooter();
	}
	
	//setTimeout(function(){    
		//$("#xprs").disableSelection();
		//PreviewHelper.updateParent({"deliver_to":"parent","action":"finished-loading"});
   // }, 500);
	
	
};

PreviewHelper.injectPreviewFooter = function(){
	var footer = $("<div class='preview-bottom-bar'>");
	var footerInner = $("<div class='bottom-inner'>");
	var footerBtn = $("<div id='choose-template-btn' class='clickable'>Edit this template, it's free</div>");
	footerBtn.unbind("click").bind("click",function(){
		XPRSHelper.updateParent({"deliver_to":"parent","action":"start-editing"});
	});
	$(".master.item-box").last().after(footer.append(footerInner.append(footerBtn)));
};


PreviewHelper.disableRightClickMenu = function(){
	document.oncontextmenu = function() {return false;};
};





PreviewHelper.overrideLinks = function(currentHolder){
	currentHolder.find("a").each(function(){
		var currentLink = $(this);
		var currentHref = currentLink.attr("href");
		currentLink.attr("data-href", currentHref);
		linkType = 	currentLink.attr("data-link-type")
		if (linkType == "EXISTING"){
			currentHref = currentHref + "?in_preview=true";
		}
		currentLink.attr("href",currentHref);
		//currentLink.removeAttr("target");
//		if (currentLink.hasClass("image-link")){
//			currentLink.removeClass("top-layer");
//		}
	});
};



PreviewHelper.getCurrentUser = function(){
	var userFromCookie = XPRSHelper.getXprsCookie("xprs_user");
	if (typeof  userFromCookie == "undefined"){
		return "guest";
	}else{
		return userFromCookie;
	}
};



PreviewHelper.handleDevicePreview = function(params){
	PreviewHelper.mode = "preview";
	var backToEditMode = false;
	$("#xprs").removeClass("shadowed");
	if (params.device_type == "editor"){
		$(".stripe-controls").removeClass("deactivated");
		PreviewHelper.mode = "guest";
	}else{
		$(".stripe-controls").addClass("deactivated");	
	}
	
	XPRSHelper.onCssTransitionFinish($("#xprs"),function(){
		SpimeEngine.ArrangeAll();
		$("#xprs").addClass("shadowed");
	});

	var deviceSizeTable = {"cellphone":{"width":320,"height":480,"border_top":"55px","border_bottom":"55px"},"tablet":{"width":768,"height":1024,"border_top":"25px","border_bottom":"55px"},"desktop":{"width":"100%","height":"100%"},"editor":{"width":"100%","height":"100%"}};
	var deviceObj = deviceSizeTable[params.device_type];
	var wrapperLeft = 0;
	var wrapperTop = 0;
	$("#xprs").css({"transform": "scale(1,1)","-ms-transform": "scale(1,1)","-webkit-transform": "scale(1,1)"});
	if (deviceObj.width != "100%"){
		
		if (deviceObj.height + 250 > $("body").height()){
			scale =  ($("body").height() -250) /  deviceObj.height ;//Math.min(width/$("body").height() - deviceObj.height/2, height/maxHeight);
			//console.log("body is " + $("body").height() + " and device is " + deviceObj.height + " scale should be " +  scale);
			$("#xprs").css({"transform": "scale("+scale+")","-ms-transform": "scale("+scale+")","-webkit-transform": "scale("+scale+")"});
			//$("#xprs").css({"transform": "scale(0.9,0.9)","-ms-transform": "scale(0.9,0.9)","-webkit-transform": "scale(0.9,0.9)"});
			 wrapperLeft = $("body").width()/2 - deviceObj.width/2;
			 wrapperTop =  -1 * (100*scale);
			 
		}else{
			 wrapperLeft = $("body").width()/2 - deviceObj.width/2;
			 wrapperTop = $("body").height()/2 - deviceObj.height/2;
		}
		
		$("#xprs").css({"-webkit-border-radius": "20px","-moz-border-radius": "20px","border-radius": "20px","border":"25px solid #000000","border-top-width":deviceObj.border_top,"border-bottom-width":deviceObj.border_bottom});
	}else{
		$("#xprs").css({"-webkit-border-radius": "0px","-moz-border-radius": "0px","border-radius": "0px","border":"0px solid #000000"});
	}
	$("body").css("background-color","#333");
	
	$("#xprs").css({
		"width":deviceObj.width,
		"height":deviceObj.height,
		"left":wrapperLeft,
		"top":wrapperTop
	});
};

PreviewHelper.handleNavigation = function(params){
	var parentHolder = $("#" + params.parentId);
	if (parentHolder.length > 0 ){
		var navigatedItem = parentHolder.find("#" + params.vbid);
		if (navigatedItem.length > 0 ){
			//if (!(navigatedItem.is(':visible'))){
				SpimeEngine.showItem(parentHolder,params.vbid);	
			//}
		}
	}else{
		//parent is not in view
	}
};




PreviewHelper.receiveMessage = function(event){
	switch (event.data.action) {
	    case "device-preview":
	    	PreviewHelper.handleDevicePreview(event.data);
	        break;	
	    case "inject-footer":
	    	//PreviewHelper.injectPreviewFooter();
	        break;
	}
};

PreviewHelper.updateParent = function(msg){
	XPRSHelper.getParentWindow().postMessage(msg, '*');
};

