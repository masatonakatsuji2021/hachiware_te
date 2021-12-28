const fs = require("fs");
const path0 = require("path");
const tool = require("hachiware_tool");

const Hachiware_TE = function(option){

	var templateEngines = null;
	var _sync = false;

	if(!option){
		option = {};
	}

	var _request = null;
	if(option.request){
		_request = option.request;
	}

	var _response = null;
	if(option.response){
		_response = option.response;
	}

	/**
	 * setContents
	 * @param {*} source 
	 */
	this.setContents = function(source, callback){

		const startTag = "<?te";
		const startSyncTag = "<?sync";
		const endTag = "?>";

		var scripts = [];
		var contents = [];
		var syncScriptStr = "";

		var syncBuffers = source.split(startSyncTag);

		if(syncBuffers.length > 1){

			_sync = true;

			for(var n = 1 ; n < syncBuffers.length ; n++){
				var b_ = syncBuffers[n];

				var bsplit = b_.split(endTag);
				syncScriptStr += bsplit[0];

				source = source.replace(startSyncTag + bsplit[0] + endTag, "");
			}
		}

		var buffers = source.split(startTag);

		contents.push(buffers[0]);

		for(var n = 1 ; n < buffers.length ; n++){
			var b_ = buffers[n];

			var bsplit = b_.split(endTag);
			scripts.push(bsplit[0]);
			contents.push(bsplit[1]);
		}

		var convertHtml = "";
		for(var n = 0 ; n < contents.length ; n++){
			var c_ = contents[n];

			convertHtml += "\n_outToBase64(\"" + tool.base64Encode(c_) + "\");";

			if(scripts[n]){
				convertHtml += scripts[n];
			}
		}

		const TemplateEngines = function(_html, _syncScript, option, callback){

			if(option.data){
				var colums = Object.keys(option.data);
				for(var n = 0 ; n < colums.length ; n++){
					var field = colums[n];
					var value = option.data[field];
					this[field] = value;
				}
			}

			var _string = "";
			var _exited = false;
			var _resolved = false;
			var _exitData = null;

			/**
			 * sanitize
			 * @param {*} str 
			 * @returns 
			 */
			const sanitize = function(str){

				if(_exited){ return ; }

				if(
					str == undefined || 
					str == null || 
					str == NaN
				){
					str = "";
				}

				var sList = {
					"<": "&lt;",
					">": "&gt;",
				};
				var colums = Object.keys(sList);
				for(var n = 0 ; n < colums.length ; n++){
					var field = colums[n];
					var value = sList[field];
					str = str.toString().split(field).join(value);
				}
				return str;
			};

			/**
			 * echo
			 * @param {*} str 
			 * @param {*} unSanitaized 
			 */
			const echo = function(str, unSanitaized){

				if(_exited){ return ; }

				if(
					str == undefined || 
					str == null || 
					str == NaN
				){
					str = "";
				}

				if(!unSanitaized){
					str = sanitize(str);
				}
				_string += str;
			};

			/**
			 * debug
			 * @param {*} object 
			 */
			const debug = function(object){

				if(_exited){ return ; }

				var className = "";
				var end = "";
				if(tool.objExists(object,"constructor.name")){
					className = object.constructor.name + " (";
					end = "}";
				}
				echo(className + JSON.stringify(object,null,"  ") + end);
			};

			/**
			 * load
			 * @param {*} filePath 
			 * @param {*} data 
			 * @param {*} callback 
			 * @param {*} catchCallback 
			 */
			const load = function(filePath, data, callback, catchCallback){
				
				if(_exited){ return ; }

				var buffer = loadBuffer(filePath, data, callback, catchCallback);

				if(callback){
					return;
				}

				_string += buffer.html;

				return buffer.res;
			};

			/**
			 * loadBuffer
			 * @param {*} filePath 
			 * @param {*} data 
			 * @param {*} callback 
			 * @param {*} catchCallback 
			 * @returns 
			 */
			const loadBuffer = function(filePath, data, callback, catchCallback){

				if(_exited){ return ; }

				if(filePath.substring(0,1) == "/"){
					var nextOption = {
						path: option.currentPath,
						currentPath: option.currentPath,
						$parent: option,
					};

					var filePath2 = filePath;
				}
				else{
					var nextOption = {
						path: option.path + "/" + path0.dirname(filePath),
						currentPath: option.currentPath,
						$parent: option,
					};

					var filePath2 = path0.basename(filePath);
				}

			
				nextOption.data = data;

				var path = nextOption.path + "/" + filePath2;

				try{

					if(!fs.existsSync(path)){
						throw Error("\"" + filePath + "\" is not found.");
					}
			
					if(!fs.statSync(path).isFile()){
						throw Error("\"" + filePath + "\" is not file.");
					}
	
				}catch(error){

					if(callback || catchCallback){
						if(catchCallback){
							catchCallback(error);
						}
					}
					else{
						if(option.errorDebug){
							echo(error.message.toString());
						}	
					}

					if(callback){
						callback(null,null, error);
					}

					return;
				}

				var hte = new Hachiware_TE(nextOption);

				if(callback){
					hte.setFile(filePath2, function(html){
						callback(this._output, html);
					});
				}
				else{
					hte = hte.setFile(filePath2);

					return {
						html: hte.out(),
						res: hte.getResData(),
					};	
				}
			};

			const request = {
				get: function(name){
					if(_exited){ return ;}

					if(name){
						if(_request[name]){
							return _request[name];
						}
						else{
							return null;
						}

					}
					else{
						return _request;
					}
				},
				url: function(){
					if(_exited){ return; }

					return _request.url;
				},
				method: function(){
					if(_exited){ return; }

					return _request.method;
				},
				header: function(name){
					if(_exited){ return; }

					if(name){
						if(_request.headers[name]){
							return _request.headers[name];
						}
						else{
							return null;
						}
					}
					else{
						return _request.headers;
					}
				},
				query: function(name){
					if(_exited){ return; }

					if(!_request.query){
						return null;
					}

					if(name){
						if(_request.query[name]){
							return _request.query[name];
						}
						else{
							return null;
						}
					}
					else{
						return _request.query;
					}
				},
				body: function(name){
					if(_exited){ return; }

					
					if(!_request.body){
						return null;
					}

					if(name){
						if(_request.body[name]){
							return _request.body[name];
						}
						else{
							return null;
						}
					}
					else{
						return _request.body;
					}
				},
			};


			const response = {
				get: function(name){
					if(_exited){ return ;}

					if(name){
						if(_response[name]){
							return _response[name];
						}
						else{
							return null;
						}

					}
					else{
						return _response;
					}
				},
				header: function(name, value){
					if(_exited){ return ;}

					if(!name){
						return _response._header;
					}

					if(value){
						_response.setHeader(name, value);
					}
					else{
						_response.setHeader(name, "");
					}
				},
				statusCode: function(code){
					if(_exited){ return ;}

					if(code){
						_response.statusCode = code;
					}
					else{
						return _response.statusCode;
					}
				},
			};

			/**
			 * _outToBase64
			 * @param {*} bstr
			 */
			const _outToBase64 = function(bstr){
				var str = tool.base64Decode(bstr);
				_string += str;
			};

			this._output = null;

			/**
			 * _getHtmlSource
			 * @returns 
			 */
			this._getHtmlSource = function(){
				return _string;
			};

			var cond = this;

			const throws = function(error){

				if(option.errorDebug){
					if(error.stack){
						_string += error.stack;
					}
					else{
						_string += error;
					}
				}

				if(_response){

					if(_response.statusCode == 200){
						_response.statusCode = 500;
					}
					if(callback){
						callback.bind(cond)(_string, _request, _response, error);
					}
				}
			};

			/**
			 * resolve
			 * @returns 
			 */
			var resolve = function(data){

				_exitData = data;

				if(!_sync){
					_exited = true;
					return;
				}
			
				if(_resolved){ return;}

				_resolved = true;
	
				try{
					eval(_html);
					if(_exitData){
						this._output = _exitData;
					}
					callback.bind(cond)(_string, _request, _response);
				}catch(error){
					throws(error);
				}
			};

			resolve = resolve.bind(this);

			try{
				if(_sync){
					eval(_syncScript);
				}
				else{
					eval(_html);
	
					if(_exitData){
						this._output = _exitData;
					}

					if(callback){
						callback.bind(cond)(_string, _request, _response);
					}
				}
			}catch(error){
				console.log(error);
				throws(error);
			}
		};

		templateEngines = new TemplateEngines(convertHtml, syncScriptStr, option, callback);

		return this;
	};

	/**
	 * setFile
	 * @param {*} filePath 
	 * @returns 
	 */
	this.setFile = function(filePath, callback){

		if(!option.path){
			option.path = "";
		}

		if(!option.currentPath){
			option.currentPath = option.path;
		}

		var path = option.path + "/" + filePath;

		path = path.split("//").join("/");

		try{

			if(!fs.existsSync(path)){
				throw Error("\"" + filePath + "\" is not found.");
			}
	
			if(!fs.statSync(path).isFile()){
				throw Error("\"" + filePath + "\" is not file.");
			}
	
		}catch(error){
						
			if(callback){

				if(option.response){
					option.response.statusCode = 404;
				}

				callback("", option.request, option.response, error);
			}

			return;
		}

		var text = fs.readFileSync(path).toString();
		return this.setContents(text, callback);
	};

	/**
	 * out
	 * @returns 
	 */
	this.out = function(){
		
		if(!templateEngines){
			return;
		}

		return templateEngines._getHtmlSource();
	};

	this.getResData = function(){

		if(!templateEngines._output){
			return;
		}

		return templateEngines._output;
	};

	this.load = function(filePath, callback){

		if(callback){
			this.setFile(filePath, callback);
		}
		else{
			return this.setFile(filePath).out();
		}

	};

	if(option.load){
		if(option.callback){
			this.load(option.load, option.callback);
		}
		else{
			this.load(option.load);
		}
	}

};
module.exports = Hachiware_TE;