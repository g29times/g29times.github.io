
/********* FILE OPERATION *********/
// IE
// var fso = new ActiveXObject("Scripting.FileSystemObject"); 
// f = fso.CreateTextFile("_log.txt", true);

// HTML5 Drag and Drop File
// http://blog.csdn.net/oscar999/article/details/37499743/
function dragenter(e) {    
	e.stopPropagation();    
	e.preventDefault();    
}    

function dragover(e) {    
	e.stopPropagation();    
	e.preventDefault();    
}  

function drop(e) {    
	e.stopPropagation();    
	e.preventDefault();     
	var dt = e.dataTransfer;    
	var files = dt.files;  
	if(files.length)  
	{  
	   var file = files[0];  
	   var reader = new FileReader();  
	   reader.onload = function()  
	   {  
		   document.getElementById("filecontent").innerHTML = this.result;  
	   };  
	   reader.readAsText(file);  
	}  
}
// HTML5 文件展示
function  handleFiles(files) {
	if(files.length) {
		var file = files[0];
		var reader = new FileReader();
		reader.onload = function() {
			document.getElementById("filecontent").innerHTML = this.result;  
		};
		reader.readAsText(file);
	}
}

/********* DATE OPERATION *********/
Date.prototype.format = function(format) { 
	var o = { 
		"M+" : this.getMonth()+1, //month 
		"d+" : this.getDate(), //day 
		"h+" : this.getHours(), //hour 
		"m+" : this.getMinutes(), //minute 
		"s+" : this.getSeconds(), //second 
		"q+" : Math.floor((this.getMonth()+3)/3), //quarter 
		"S" : this.getMilliseconds() //millisecond 
	} 

	if(/(y+)/.test(format)) { 
		format = format.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length)); 
	} 

	for(var k in o) { 
		if(new RegExp("("+ k +")").test(format)) { 
			format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length)); 
		} 
	} 
	return format; 
} 