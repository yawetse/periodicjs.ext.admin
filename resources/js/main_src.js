'use strict';

var formobj = require('./formtoobject'),
	request = require('superagent'),
	ribbon = require('ribbonjs'),
	silkscreen = require('silkscreenjs');

window.addEventListener("load",function(){
	window.silkscreenModal = new silkscreen(),
	window.ribbonNotification = new ribbon({type:"info",idSelector:"#_pea_ribbon-element"});
	preventEnterSubmitListeners();
},false);

var preventSubmitOnEnter = function(e){
	// console.log("key press");
	if ( e.which === 13 || e.keyCode === 13  ) {
		// console.log(e);
		// console.log("prevent submit");
		e.preventDefault();
		return false;
	}
};

var preventEnterSubmitListeners = function(){
	var noSubmitElements = document.querySelectorAll('.noFormSubmit');
	for(var x in noSubmitElements){
		if(typeof noSubmitElements[x] ==='object'){
			noSubmitElements[x].addEventListener("keypress",preventSubmitOnEnter,false);
			noSubmitElements[x].addEventListener("keydown",preventSubmitOnEnter,false);
		}
	}
	document.addEventListener("keypress",preventSubmitOnEnter,false);
};

window.makeNiceName = function(username) {
	if (username) {
		return username.replace(/[^a-z0-9]/gi, '-').toLowerCase();
	}
	else {
		return false;
	}
};

//"._pea-ajax-form" http://www.sitepoint.com/easier-ajax-html5-formdata-interface/
window.ajaxFormEventListers = function(selector){
	var ajaxforms = document.querySelectorAll(selector);
	for(var x in ajaxforms){
		if(typeof ajaxforms[x] ==='object'){
			// console.log(new FormData(ajaxforms[x]));
			ajaxforms[x].addEventListener("submit",function(e){
				var f = e.target;
				if(f.getAttribute("data-beforesubmitfunction")){
					var beforesubmitFunctionString = f.getAttribute("data-beforesubmitfunction"),
					beforefn = window[beforesubmitFunctionString];
					// is object a function?
					if (typeof beforefn === "function"){beforefn(e)};
				}
				var formData = new formobj(f);
				
				request
					.post(f.action)
					.set('x-csrf-token',document.querySelector('input[name=_csrf]').value)
					.set('Accept', 'application/json')
					.query({ format: 'json' })
					.send(formData)
					.end(function(error, res){
						if(res && res.body && res.body.result==='error'){
							ribbonNotification.showRibbon( res.body.data.error,4000,'error');
						}
						else if(res && res.clientError){
							ribbonNotification.showRibbon( res.status+": "+res.text,4000,'error');
						}
						else if(error){
							ribbonNotification.showRibbon( error.message ,4000,'error');
						}
						else{
							ribbonNotification.showRibbon("saved",4000,'success');
							if(f.getAttribute("data-successfunction")){
								var successFunctionString = f.getAttribute("data-successfunction"),
								successfn = window[successFunctionString];
								// is object a function?
								if (typeof successfn === "function"){successfn(res.body.data)};
							}
						}
					});

				e.preventDefault();
			},false);
		}
	}
};