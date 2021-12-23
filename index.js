const fs = require("fs");
const tool = require("hachiware_tool");

const Hachiware_TE = function(option){

	var templateEngines = null;

	if(!option){
		option = {};
	}

	/**
	 * setContents
	 * @param {*} source 
	 */
	this.setContents = function(source){

		const startTag = "<?te";
		const endTag = "?>";

		var scripts = [];
		var contents = [];

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

			convertHtml += "_outToBase64(\"" + tool.base64Encode(c_) + "\", true);";

			if(scripts[n]){
				convertHtml += scripts[n];
			}
		}

		const TemplateEngines = function(_html, option){

			if(option.data){
				var colums = Object.keys(option.data);
				for(var n = 0 ; n < colums.length ; n++){
					var field = colums[n];
					var value = option.data[field];
					this[field] = value;
				}
			}

			var _string = "";

			/**
			 * sanitize
			 * @param {*} str 
			 * @returns 
			 */
			const sanitize = function(str){
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
			 */
			const load = function(filePath, data){
				var buffer = loadBuffer(filePath, data);
				echo(buffer);
			};

			/**
			 * loadBuffer
			 * @param {*} filePath 
			 * @param {*} data 
			 * @returns 
			 */
			const loadBuffer = function(filePath, data){

				if(data){
					option.data = data;
				}

				var hte = new Hachiware_TE(option);
				return hte.setFile(filePath).out();
			};

			/**
			 * _outToBase64
			 * @param {*} bstr 
			 * @param {*} unSanitaized 
			 */
			const _outToBase64 = function(bstr, unSanitaized){
				var str = tool.base64Decode(bstr);
				echo(str, unSanitaized);
			};

			/**
			 * _getHtmlSource
			 * @returns 
			 */
			this._getHtmlSource = function(){
				return _string;
			};

			try{
				eval(_html);
			}catch(error){

				if(option.errorDebug){
					if(error.stack){
						_string += error.stack
					}
					else{
						_string += error;
					}
				}
			}
		};

		templateEngines = new TemplateEngines(convertHtml, option);

		return this;
	};

	/**
	 * setFile
	 * @param {*} filePath 
	 * @returns 
	 */
	this.setFile = function(filePath){

		if(!option.path){
			option.path = "";
		}

		var path = option.path + "/" + filePath;

		if(!fs.existsSync(path)){
			throw Error("\"" + filePath + "\" is not found.");
		}

		if(!fs.statSync(path).isFile()){
			throw Error("\"" + filePath + "\" is not file.");
		}

		var text = fs.readFileSync(path).toString();
		return this.setContents(text);
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

};
module.exports = Hachiware_TE;