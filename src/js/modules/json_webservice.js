//!#include "../header.js"

var EXPORTED_SYMBOLS = ['JsonWebservice'];

var JsonWebservice = (function() {
    return function(url) {
	this.url = url;
    };
}());

var SimpleAjax = function(domain) {
    this.domain = domain;
    var simpleAjax = this;

    this.xmlhttp = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
		       .createInstance(Components.interfaces.nsIXMLHttpRequest);

    function onAjaxResponse() {
	if(simpleAjax.xmlhttp.readyState == 4 && simpleAjax.xmlhttp.status == 200 && simpleAjax.onSuccess != null) {
	    simpleAjax.onSuccess(simpleAjax.xmlhttp.status, simpleAjax.xmlhttp.responseText);
	}
    }

    this.xmlhttp.onreadystatechange = onAjaxResponse;
    this.onSuccess = null;
};

SimpleAjax.prototype.get = function(destination,callback) {
    this.onSuccess = callback;
    this.xmlhttp.open("GET",this.buildUrl(destination));
    this.xmlhttp.send(null);
};

SimpleAjax.prototype.post = function(destination,params,callback) {
    this.onSuccess = callback;
    this.xmlhttp.open("POST",this.buildUrl(destination));
    this.xmlhttp.send(params);
};

SimpleAjax.prototype.put = function(destination,params,callback) {
    this.onSuccess = callback;
    this.xmlhttp.open("PUT", this.buildUrl(destination));
    this.xmlhttp.send(params);
};

SimpleAjax.prototype.buildUrl = function(destination) {
    return(this.domain + destination);
}

JsonWebservice.prototype = {
    getURLs: function(runWhenFinished) {
	var urls = [];
	var ajax = new SimpleAjax(this.url);
	ajax.get('/urls.json',function(status,responseText) {
	    var resultSet = JSON.parse(responseText);
	    for each(var url in resultSet) {
		urls.push(url.url);
	    }
	    runWhenFinished(urls);
	});
    },
    getAllNotes: function(runWhenFinished) {
	var notes = [];
	var ajax = new SimpleAjax(this.url);
	ajax.get("/notes.json",function(status,responseText) {
	    var resultSet = JSON.parse(responseText);
	    for each(var note in resultSet) {
		notes.push(note);
	    }
	    runWhenFinished(notes);
	});
    },

    // For now the note fetching by url is synchronous
    getNotesForURLs: function(urls,runWhenFinished) {
	notes = [];
	var urlLength = urls.length;

	function flatten(array){
	    var flat = [];
	    for (var i = 0, l = array.length; i < l; i++){
		var tempArray = array[i];
		if(tempArray.length > 0)
		    flat = flat.concat(array[i]);
	    }
	    return flat;
	}
	
        while(urls.length > 0) {
	    var url = urls.shift();
	    var ajax = new SimpleAjax(this.url);
	    
	    ajax.get("/notes.json?url=" + url, function(status,responseText) {
		var note = JSON.parse(responseText);
		notes.push(note);
		if(notes.length == urlLength) {
		    var flattenNotes = flatten(notes);
		    runWhenFinished(flattenNotes);
		}
		    
	    });
	}
    },

    createNoteAndGetId: function(note,runWhenFinished) {
	var ajax = new SimpleAjax(this.url);
	ajax.post("/notes.json",JSON.stringify(note),function(status,responseText) {
	    LOG("Note has been created");
	});
    },
    updateNote: function(note,runWhenFinished) {
	var ajax = new SimpleAjax(this.url);
	ajax.post("/notes/" + note.guid + ".json",JSON.stringify(note),function(status,responseText) {
	    LOG("Note has been updated");
	});
    },

    deleteNote: function(note_guid,runWhenFinished) {
	
    }
};


