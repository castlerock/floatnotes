var EXPORTED_SYMBOLS = ['JsonWebservice'];

var JsonWebservice = (function() {
    return function(url) {
	this.url = url;
    };
});

var SimpleAjax = function(domain) {
    this.domain = domain;
    var simpleAjax = this;

    this.xmlhttp = window.XMLHttpRequest ? 
	new XMLHttpRequest() : 
	new ActiveXObject("Microsoft.XMLHTTP");

    function onAjaxResponse() {
	if(simpleAjax.xmlhttp.readystate == 4 && simpleAjax.xmlhttp.status == 200 && simpleAjax.onSuccess != null) {
	    simpleAjax.onSuccess(simpleAjax.xmlhttp.status, simpleAjax.xmlhttp.responseText);
	}
	simpleAjax.onSuccess = null;
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
	var notes = [];
	var ajax = new SimpleAjax(this.url);
	for each (var url in urls) {
	    ajax.get("/notes.json?url=" + url, function(status,responseText) {
		var resultSet = JSON.parse(responseText);
		for each(var note in resultSet) {
		    notes.push(note);
		}
	    });
	}
	runWhenFinished(notes);
    },
};


