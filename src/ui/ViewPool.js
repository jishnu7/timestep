/**
 * @class ui.ViewPool;
 * facilitates easy view re-use
 */

exports = Class(function() {

	/**
	 * ctor (function) constructor function for the class you want to pool,
	 	must inherit from View
	 * initCount (integer) pre-initialize this many views,
	 	for optimal performance, avoid view instantiation during gameplay
	 * initOpts (object) opts object used to pre-initialize your views
	 */
	this.init = function(opts) {
		// constructor (required)
		this.ctor = opts.ctor;

		this.views = [];
		this.freshQueue = [];

		// early initialization to avoid dropping frames
		var initCount = opts.initCount,
			initOpts = opts.initOpts;
		if (initCount) {
			for (var i = 0; i < initCount; i++) {
				var view = new this.ctor(initOpts);
				view.style.visible = false;
				view.poolIndex = this.views.length;
				this.views.push(view);
				this.freshQueue.push(view.poolIndex);
			}
		}
	};



	/**
	 * opts (object) populated with view opts properties
	 * returns a view from the pool
	 */
	this.obtainView = function(opts) {
		var view;

		// re-use an existing view if we can
		if (this.freshQueue.length) {
			view = this.views[this.freshQueue.pop()];

			// apply opts to view style
			for (var prop in opts) {
				if (prop in view.style) {
					view.style[prop] = opts[prop];
				}
			}

			var parent = opts.parent || opts.superview;
			parent && parent.addSubview(view);
		} else {
			// create a new view
			view = new this.ctor(opts);
			view.poolIndex = this.views.length;
			this.views.push(view);
		}

		view.style.visible = true;
		return view;
	};



	/**
	 * view (instance of this.ctor) to be recycled
	 */
	this.releaseView = function(view) {
		view.style.visible = false;
		this.freshQueue.push(view.poolIndex);
	};



	/**
	 * release all views, ensuring none of them are already released
	 */
	this.releaseAllViews = function() {
		for (var i = 0; i < this.views.length; i++) {
			var view = this.views[i];
			if (this.freshQueue.indexOf(view.poolIndex) < 0) {
				this.releaseView(view);
			}
		}
	};
});