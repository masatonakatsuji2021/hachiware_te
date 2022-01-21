/**
 * ===================================================================================================
 * hachiware_te
 * 
 * node.js Template Engine.
 * 
 * License : MIT License. 
 * Since   : 2022.01.15
 * Author  : Nakatsuji Masato 
 * Email   : nakatsuji@teastalk.jp
 * HP URL  : https://hachiware-js.com/
 * GitHub  : https://github.com/masatonakatsuji2021/hachiware_te
 * npm     : https://www.npmjs.com/package/hachiware_te
 * ===================================================================================================
 */

const fs = require("fs");
const path0 = require("path");
const tool = require("hachiware_tool");

const Hachiware_TE = function(option){

	var templateEngines = null;
	var _sync = false;

	if(!option){
		option = {};
	}

	var request = null;
	if(option.request){
		request = option.request;
	}

	var response = null;
	if(option.response){
		response = option.response;
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

				const getCircularReplacer = () => {
					const seen = new WeakSet();
					return (key, value) => {
						if (typeof value === "object" && value !== null) {
							if (seen.has(value)) {
							return;
						}
						seen.add(value);
					  }
					  return value;
					};
				};
				
				echo(className + JSON.stringify(object,getCircularReplacer(),"    ") + end);
			};

			/**
			 * load
			 * @param {*} filePath 
			 * @param {*} data
			 */
			const load = function(filePath, data){
				
				if(_exited){ return ; }

				var buffer = loadBuffer(filePath, data);
				_string += buffer;
			};

			/**
			 * loadBuffer
			 * @param {*} filePath 
			 * @param {*} data 
			 * @returns 
			 */
			const loadBuffer = function(filePath, data){

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

					if(option.errorDebug){
						echo(error.toString());
					}

					return;
				}

				var hte = new Hachiware_TE(nextOption);
				return hte.setFile(filePath2).out();
			};

			/**
			 * loadJs
			 * @param {*} filePath 
			 * @returns 
			 */
			const loadJs = function(filePath){
				if(_exited){ return ; }
	
				if(filePath.substring(0,1) == "/"){
					var _path = option.currentPath;
					var filePath2 = filePath;
				}
				else{
					var _path = option.path + "/" + path0.dirname(filePath);
					var filePath2 = path0.basename(filePath);
				}
			
				var path = _path + "/" + filePath2;

				try{

					if(!fs.existsSync(path)){
						throw Error("\"" + filePath + "\" is not found.");
					}
			
					if(!fs.statSync(path).isFile()){
						throw Error("\"" + filePath + "\" is not file.");
					}
	
				}catch(error){

					if(option.errorDebug){
						echo(error.toString());
					}
					return;
				}

				return require(path);
			};

			/**
			 * _outToBase64
			 * @param {*} bstr
			 */
			const _outToBase64 = function(bstr){
				var str = tool.base64Decode(bstr);
				_string += str;
			};

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

				if(response){

					if(response.statusCode == 200){
						response.statusCode = 500;
					}
					if(callback){
						callback.bind(cond)(_string, request, response, error);
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
					callback.bind(cond)(_string, request, response);
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
					if(callback){
						callback.bind(cond)(_string, request, response);
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

	/**
	 * load
	 * @param {*} filePath 
	 * @param {*} callback 
	 * @returns 
	 */
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