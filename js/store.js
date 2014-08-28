(function (window) {
	'use strict';

	function Store(name, callback) {
		callback = callback || function () {};

		this._dbName = name;

		if (!localStorage[name]) {
			localStorage[name] = JSON.stringify([]);
		}

		callback.call(this, JSON.parse(localStorage[name]));
	}

	Store.prototype.findAll = function (callback) {
		callback = callback || function () {};
		callback.call(this, JSON.parse(localStorage[this._dbName]));
	};

	Store.prototype.save = function (data, callback) {
		var tasks = JSON.parse(localStorage[this._dbName]);

		callback = callback || function () {};
		localStorage[this._dbName] = JSON.stringify(data);
		callback.call(this, data);
	};

	window.goalist = window.goalist || {};
	window.goalist.Store = Store;
})(window);
