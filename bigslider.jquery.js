;(function($, window, undefined) {



	var pName = "bigSlider",
		document = window.document,
		defaults = {
			arrows: true,
			arrow_text: ["&#8249;", "&#8250;"],

			thumbs: false,
			dynamic_thumbs: false,
            thumbs_margin: 5,
			
			auto: false,
            pause_on_hover: true,
            time: 3000,
			
			thumbs_selector: "#tmb_view",
			single_slide: ".slide",
			view_selector: "#view_window",
			slidesUL: ".slides",

			data: ""
		};


	function BigSlider(el, opts) {


		// elements
		this.el = el;
		this.$e = $(el);

        //options object
		this.opts = $.extend({}, defaults, opts) ;

	    this._defaults = defaults;
	    this._name = pName;

	    // var for the auto loop
	    this.loop = undefined;


	    if (this.opts.data === "") {

	    	this.set_vars();

	    	if (this.opts.arrows) {
	    		this.render("arrows");
	    	}

	    	if (this.opts.dynamic_thumbs && this.opts.thumbs) {
	    		this.render("dynamic_thumbs");
	    	}

	    	this.init();
	    } else {
	    	this.render("body");

	    	if (this.opts.arrows) {
	    		this.render("arrows");
	    	}

	    	if (this.opts.dynamic_thumbs && this.opts.thumbs) {
	    		this.render("dynamic_thumbs");
	    	}

	    	if (!this.opts.dynamic_thumbs && this.opts.thumbs) {
	    		this.render("thumbs");
	    	}

	    	this.set_vars();

	    	this.init();
	    }

	}	


    // this function sets all the variables required throughout the plug-in
	BigSlider.prototype.set_vars = function() {
		var o = this.opts;

		this.$view	   = this.$view || this.$e.find(o.view_selector);
		this.$slides   = this.$slides || this.$e.find(o.single_slide);
		this.$slidesUL = this.$slidesUL || this.$e.find(o.slidesUL);
		this.$tmb_view = $(o.thumbs_selector);
		this.$thumbsUL = this.$tmb_view.find("ul:first-child");
		this.$thumbs   = this.$tmb_view.find("li");

		// counters and constants
		this.curr_slide = 0;
		this.num_slides = this.$slides.length;
	}



    // main INIT function
	BigSlider.prototype.init = function() {


		// set the width of the ul containing the slides
		this.$slidesUL.width(this.$slides.outerWidth(true)*this.num_slides);


		// set the width for the tumbnails:
		this.$thumbs.css("width", Math.floor((this.$e.width()-this.opts.thumbs_margin*(this.$thumbs.length-1)) / this.$thumbs.length));

		this.$thumbsUL.width(this.$thumbs.outerWidth(true)*this.$thumbs.length);
		
		// loop through the thumbnails and assign them the number associated with the slides
		this.$thumbs.each(function(i) {
			$(this).data("slide", i);
		});

		// set the first slide and reset the scrolling:
		this.$view.animate({scrollLeft: 0}).attr("class", "slide-0");


        if (this.opts.auto) {
            var self = this;
            this.$e.on("expo:slider_init", function() {
                self.start_auto();
            });
        }


		this.events();

	}



    // function for seeting up all the EVENTS
	BigSlider.prototype.events = function() {

		var self = this;


		this.$e.on("expo:slide_change", function() {

			if (self.curr_slide === 0) {
				$(".expo_arrow.left").hide();
			} else {
				$(".expo_arrow.left").show();
			}

			if (self.curr_slide+1 === self.num_slides) {
				$(".expo_arrow.right").hide();
			} else {
				$(".expo_arrow.right").show();
			}

		});


		$(".expo_arrow.right").on("click", function() {
			if (self.curr_slide+1 <= self.num_slides) {
				self.curr_slide++;
				self.$view.animate({scrollLeft: "+=" + self.$e.width()}).attr("class", "slide-" + self.curr_slide);

				self.$e.trigger("expo:slide_change");
			}
		});

		$(".expo_arrow.left").on("click", function() {
			if (self.curr_slide-1 >= 0) {
				self.curr_slide--;
				self.$view.animate({scrollLeft: "-=" + self.$e.width()}).attr("class", "slide-" + self.curr_slide);

				self.$e.trigger("expo:slide_change");
			}
		}).hide();

		this.$thumbs.on("click", function() {
			self.curr_slide = $(this).data("slide");
			self.$view.animate({scrollLeft: self.$e.width() * self.curr_slide}).attr("class", "slide-" + self.curr_slide);

			self.$e.trigger("expo:slide_change");
		});


        // when pause_on_over == true, then pause the intervalled function when the mouse enters and vice versa
        if (this.opts.pause_on_hover) {

	        this.$e.on("mouseenter", function() {
	            self.stop_auto();
	        });

	        this.$e.on("mouseleave", function() {
	            self.start_auto();
	        });
   		}

		this.$e.trigger("expo:slider_init");
	}


	BigSlider.prototype.start_auto = function() {
		var self = this;
		if (this.loop === undefined) {
			this.loop = setInterval(function() {

				if (self.curr_slide+1 === self.num_slides) {
					self.curr_slide = 0;
					self.$view.animate({scrollLeft: 0}).attr("class", "slide-0");
					self.$e.trigger("expo:slide_change");
				} else {
					self.$e.find(".expo_arrow.right").trigger("click");
				}

			}, this.opts.time);
		}
	}

	BigSlider.prototype.stop_auto = function() {
		clearInterval(this.loop);
		this.loop = undefined;
	}

    // just some wrapper sugar
	BigSlider.prototype.render = function(name) {

		switch (name) {

			case "arrows":
				this.render_arrows();
			break;

			case "body":
				this.render_body();
			break;

			case "dynamic_thumbs":
				this.render_dynamic_thumbs();
			break;

			case "thumbs":
				this.render_thumbs();
			break;
		}

	}


	BigSlider.prototype.render_arrows = function() {
		this.$view.after('<div class="expo_arrow left">' + this.opts.arrow_text[0] + '</div><div class="expo_arrow right">' + this.opts.arrow_text[1] + '</div>');
	}


	BigSlider.prototype.render_body = function() {

		var data       = this.opts.data,
            sildesHTML = "";

		sildesHTML += '<div id="view_window"><ul class="slides">';

		for (var i = 0; i < data.length; i++) {
            sildesHTML += ' <li class="slide"><a href="' + data[i].href + '"><img src="' + data[i].img + '" alt="#"><div class="info_block"><h3 class="title">' + data[i].title + '</h3><p class="desc">' + data[i].desc + '</p></div></a></li>';
		}

		sildesHTML += "</ul></div>";

		this.$e.append(sildesHTML);

		this.set_vars();

	}


	BigSlider.prototype.render_thumbs = function() {

		var data 	   = this.opts.data,
			thumbsHTML = "";

		thumbsHTML += '<div id="tmb_view"><ul class="thumbs">';

		for (var i = 0; i < data.length; i++) {
            if (i === data.length-1) {
                thumbsHTML += '<li class="thumb last"><img src="' +  data[i].thumb + '" /><div class="info_block"><h3 class="title">' + data[i].title + '</h3></div></li>';
            } else {
                thumbsHTML += '<li class="thumb"><img src="' +  data[i].thumb + '" /><div class="info_block"><h3 class="title">' + data[i].title + '</h3></div></li>';
            }
		}

		thumbsHTML += "</ul></div>";

		this.$view.after(thumbsHTML);

		this.set_vars();

	}

	BigSlider.prototype.render_dynamic_thumbs = function() {

		var data 	   = [],
			thumbsHTML = "";


        // get the data from the lis
		this.$slides.each(function() {

			data.push($(this).html());

		});

		thumbsHTML += '<div id="tmb_view"><ul class="thumbs">';

		for (var i = 0; i < data.length; i++) {

			if (i === data.length-1) {
				thumbsHTML += '<li class="thumb last">' + data[i] + '</li>';
			} else {
				thumbsHTML += '<li class="thumb">' + data[i] + '</li>';
			}
		}

		thumbsHTML += "</ul></div>";

		this.$view.after(thumbsHTML);

		this.set_vars();
	}	





	// Plugin wrapper to prevent double init
	$.fn[pName] = function (opts) {
    	return this.each(function () {
      		if (!$.data(this, 'plugin_' + pName)) {
        		$.data(this, 'plugin_' + pName, new BigSlider(this, opts));
      		}
    	});
  	}

})(jQuery, window, undefined);