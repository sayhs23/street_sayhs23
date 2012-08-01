/* Author : Jongmin Yoon (http://zective.com/code/pi/zPaging/)
 * Licenses : GPL (http://www.opensource.org/licenses/gpl-license.php)
 * Thanks to : Bihon (http://www.bihon.com) | Get object key
 * 
 * Version: 2.0.2
 * 
 * Requires Core: 1.2.6+
 * Requires Plug-in: 2.2+ (Mouse Wheel Extension | http://brandonaaron.net/code/mousewheel/demos)
 */

(function(jQuery){
	jQuery.zPaging = function(el, total, uri, querys, options, cssClass){
		var base = this;
		
		base.$el = jQuery(el);
		base.el = el;
		base.funcArgsObj = {};

		base.$el.data("zPaging", base);

		base.init = function() {
			base.checkChild();

			base.options = jQuery.extend({}, jQuery.zPaging.defaultOptions, options);
			base.cssClass = jQuery.extend({}, cssClass);
			base.options.movemont = base.toInt(base.options.movemont);
			base.options.perPage = base.toInt(base.options.perPage);
			base.options.selectedPage = base.toInt(base.options.selectedPage);
			base.options.linkWidth = base.toInt(base.options.linkWidth);

			base.options.perPage = (base.original != undefined && base.original.perPage) ? base.original.perPage : base.options.perPage;
			base.oneSideSize = Math.floor(base.options.perPage / 2);
			if(base.options.perPage % 2 == 0) base.options.perPage++;

			base.total = base.toInt(total);
			base.movement = base.options.movement;
			base.loop = (base.total >= base.options.perPage) ? base.options.perPage : base.total;

			base.checkURI();
			base.setSelectItem();

			var _minWidth = 300;
			base.minWidth = (_minWidth >= base.loop * base.options.linkWidth) ? _minWidth : base.loop * base.options.linkWidth;

			if(base.checkError() == false) return false;

			base.defaultChildID = base.makeRandomID();
			base.child = jQuery("<div />").attr("id", base.defaultChildID).css({width: base.loop*base.options.linkWidth+"px"});
			base.$el.append(base.child);

			base.setLoopCondition();

			if(base.options.viewInfo == true) {
				base.pagingInfo.init();
				base.$el.mouseenter(function() {
					base.slideView.slideDown("fast");
					base.$el.css({paddingBottom: "5px"});
				}).mouseleave(function() {
					base.slideView.slideUp("fast");
					base.$el.css({paddingBottom: "0"});
				});
			}

			base.$el.css({
				width: base.minWidth,
				overflow: "hidden",
				marginLeft: (base.options.align=="right"||base.options.align=="center")?"auto":"0",
				marginRight: (base.options.align=="left"||base.options.align=="center")?"auto":"0"
			});

			base.linkCss = {
				width: base.options.linkWidth,
				float: "left",
				textAlign: "center",
				display: "inline"
			};

			base.$el.children().each(function() {
				jQuery(this).css({
					clear: "both",
					marginLeft: "auto",
					marginRight: "auto",
					padding: 0
				});
			});

			base.createAreaAndUpdate(base.selectItem);
		};

		base.makeRandomID = function() {
			return "zp_"+Math.floor(Math.random()*100000000)+1;
		};

		base.getDefaultOptVal = function(val) {
			return jQuery.zPaging.defaultOptions[val];
		};

		base.toInt = function(val) {
			return parseInt(val, 10);
		};

		base.linkTitle = function(no) {
			return base.options.linkTitle.replace(/#no#/ig, no);
		};

		base.getClassName = function(val) {
			return (base.selectItem == val) ? base.cssClass.nowPage : base.cssClass.normalPage;
		};

		base.getURI = function(no) {
			return (typeof base.uri != "function") ? base.link+base.options.key+"="+no : "javascript: void(0);";
		};

		base.checkChild = function() {
			var len = base.$el.children().length;
			if(len > 0) {
				var cnt = 0;
				for(var i=0; i<len; i++) {
					if(base.$el.children().eq(i).text().trim().match(new RegExp("\\d{1,}", "g"))) cnt++;
				}
				base.original = {
					perPage: cnt
				};
				base.$el.empty();
			}
		};

		base.setSelectItem = function() {
			if(options != null && options != undefined && options.selectedPage != undefined) {
				base.selectItem = options.selectedPage;
			} else {
				var nowUrl = window.location.href, rst;
				var rexp = new RegExp("[&*]"+base.options.key+"=(\\d{1,})(&|$)", "i");
				if((rst = nowUrl.match(rexp))) base.selectItem = base.toInt(rst[1]);
				else base.selectItem = 1;
			}
			base.selectItem = (base.selectItem>base.total) ? base.total : (base.selectItem<1) ? 1 : base.selectItem;
		};

		base.setLoopCondition = function() {
			var selectItem = (!arguments[0]) ? base.selectItem : base.toInt(arguments[0]);
			if(base.total <= base.options.perPage) {
				base.loopStart = 1;
				base.loopEnd = base.total;
			} else if(selectItem <= base.oneSideSize) {
				base.loopStart = 1;
				base.loopEnd = base.options.perPage;
			} else if(selectItem> base.total - base.oneSideSize) {
				base.loopStart = base.total - base.options.perPage + 1;
				base.loopEnd = base.total;
			} else {
				base.loopStart = selectItem - base.oneSideSize;
				base.loopEnd = selectItem + base.oneSideSize;
			}
			base.loopEnd += 1;
		};

		base.checkURI = function() {
			base.uri = uri;
			if(typeof base.uri == "function") {
				var pat = /^function\s+([a-zA-Z0-9_]+)\s*\(/i;
				pat.exec(base.uri);
				var rexp = new RegExp("^function\\s+"+RegExp.$1+"\\s*\\((.*)\\)\\s*\\{", "i");
				var _querys = "";
				if(typeof querys == "object") {
					for(var i in querys) base.funcArgsObj[i] = querys[i];
				}
				base.link = "";
			} else {
				var _querys = "";
				if(typeof querys == "object") {
					for(key in querys) {
						if(querys[key] != undefined) _querys += key+"="+querys[key]+"&";
					}
				} else if(typeof querys == "string") _querys = querys+"&";
				base.querys = _querys;
				base.link = base.uri+"?"+base.querys;
			}
		};

		base.listItem = function(val) {
			return jQuery("<a />")
					.css(base.linkCss)
					.attr({
						href: base.getURI(val),
						listNo: val,
						className: base.getClassName(val),
						title: base.linkTitle(val)
					})
					.html(val)
					.unbind("click")
					.click(function() {
						base.clickHandler(this);
					});
		};

		base.clickHandler = function(obj) {
			base.funcArgsObj.zPagingKey = base.options.key;
			base.funcArgsObj[base.options.key] = base.toInt(jQuery(obj).attr("listNo"));
			if(typeof base.uri == "function") {
				base.selectItem = base.funcArgsObj[base.options.key];
				base.uri.call(null, base.funcArgsObj);
				base.createAreaAndUpdate();
			}
			if(typeof base.options.callBack == "function") base.options.callBack(base.funcArgsObj[base.options.key]);
		};

		base.createAreaAndUpdate = function() {
			base.setLoopCondition((arguments[0])?arguments[0]:null);
			if(base.options.viewInfo == true) base.pagingInfo.setInfo();
			base.$el.children().eq(0).children().each(function(){jQuery(this).remove()});
			for(var i=base.loopStart; i<base.loopEnd; i++) base.$el.children().eq(0).append(base.listItem(i).fadeIn("fast"));
			base.$el.children().eq(0).unmousewheel().mousewheel(function(event, delta) {
				if(base.total > base.options.perPage) {
					if(delta > 0) base.leftPart();
					else base.rightPart();
					if(base.options.viewInfo == true) base.pagingInfo.setInfo();
				}
				return false;
			});
		};

		base.leftPart = function() {
			for(var i=0; i<base.movement; i++) {
				if(base.loopStart < 2) return false;
				else {
					--base.loopEnd;
					var tmp = --base.loopStart;
				}
				if(!base.$el.children("a[listNo='"+(tmp)+"']").attr("nodeType")) {
					base.listItem(tmp).fadeIn("fast").prependTo("#"+base.defaultChildID);
					base.$el.children().eq(0).children().each(function() {
						if(base.toInt(jQuery(this).attr("listNo")) >= base.loopStart + base.options.perPage) jQuery(this).remove();
					});
				}
			}
		};

		base.rightPart = function() {
			for(var i=0; i<base.movement; i++) {
				if(base.loopEnd > base.total) return false;
				else {
					base.loopStart++;
					var tmp = base.loopEnd++;
				}
				if(!base.$el.children("a[listNo='"+tmp+"']").attr("nodeType")) {
					base.$el.children().eq(0).append(base.listItem(tmp).fadeIn("fast"));
					base.$el.children().eq(0).children().each(function() {
						if(base.toInt(jQuery(this).attr("listNo")) < base.loopEnd - base.options.perPage) jQuery(this).remove();
					});
				}
			}
		};

		base.checkError = function() {
			if(base.options.perPage <= 0) {
				base.$el.html("<strong>zPaging error</strong> : Check the <strong><ins>perPage</ins></strong> option.").css({font: "italic normal 9pt 'Verdana'", textAlign: "center"});
				return false;
			}
			if(base.options.perPage < base.movement) {
				base.$el.html("<strong>zPaging error</strong> : Check the <strong><ins>movement</ins></strong> option. (Must be less than '<strong>perPage</strong>')").css({font: "italic normal 9pt 'Verdana'", textAlign: "center"});
				return false;
			}
			if(typeof base.uri != "function" && options != undefined && options.selectedPage != undefined) {
				base.$el.html("<strong>zPaging error</strong> : Check the <strong><ins>selectedPage</ins></strong> option. (Can only do in the <ins>Method Link</ins> mode)").css({font: "italic normal 9pt 'Verdana'", textAlign: "center"});
				return false;
			}
			return true;
		};

		base.pagingInfo = {
			init: function() {
				base.slideViewID = base.defaultChildID+"_sv",
				base.topInfoID = base.defaultChildID+"_ti",
				base.pageFirstID = base.defaultChildID+"_first",
				base.pagePrevID = base.defaultChildID+"_prev",
				base.pageNowID = base.defaultChildID+"_now",
				base.pageNextID = base.defaultChildID+"_next",
				base.pageLastID = base.defaultChildID+"_last";
				this.makeElements();
				this.setInfo();
				this.applyActions();
				this.addElements();
			},
			makeElements: function() {
				base.slideView = jQuery("<div />").attr("id", base.slideViewID).css({width: "300px", padding: "5px", clear: "both"}).hide();
				base.topInfo = jQuery("<div />").attr({className: base.cssClass.infoPage}).css({paddingLeft: "5px", paddingRight: "5px", clear: "both"});
				base.helpLinks = jQuery("<div />").css({width: 300, textAlign: "center", margin: "0 auto", clear: "both"});
				base.pageFirst = jQuery("<div />").attr({id: base.pageFirstID, className: base.cssClass.infoPageFirst}).css({width: 50, textAlign: "center", paddingLeft: "5px", paddingRight: "5px", float: "left"});
				base.pagePrev = jQuery("<div />").attr({id: base.pagePrevID, className: base.cssClass.infoPagePrev}).css({width: 50, textAlign: "center", paddingLeft: "5px", paddingRight: "5px", float: "left"});
				base.pageNow = jQuery("<div />").attr({id: base.pageNowID, className: base.cssClass.infoPageNow}).css({width: 50, textAlign: "center", paddingLeft: "5px", paddingRight: "5px", float: "left"});
				base.pageNext = jQuery("<div />").attr({id: base.pageNextID, className: base.cssClass.infoPageNext}).css({width: 50, textAlign: "center", paddingLeft: "5px", paddingRight: "5px", float: "left"});
				base.pageLast = jQuery("<div />").attr({id: base.pageLastID, className: base.cssClass.infoPageLast}).css({width: 50, textAlign: "center", paddingLeft: "5px", paddingRight: "5px", float: "left"});
			},
			setInfo: function() {
				base.topInfo.html(base.options.infoTxt.replace(/#now#/ig, base.selectItem).replace(/#total#/ig, base.total));
			},
			applyActions: function() {
				base.pageFirst.html(base.options.goFirstTxt).unbind("click").click(function() {base.createAreaAndUpdate(1);});
				base.pagePrev.html(base.options.goPrevTxt).unbind("click").click(function() {base.leftPart();});
				base.pageNow.html(base.options.goNowTxt).unbind("click").click(function() {base.createAreaAndUpdate(base.selectItem);});
				base.pageNext.html(base.options.goNextTxt).unbind("click").click(function() {base.rightPart();});
				base.pageLast.html(base.options.goLastTxt).unbind("click").click(function() {base.createAreaAndUpdate(base.total);});
			},
			addElements: function() {
				base.helpLinks.append(base.pageFirst);
				base.helpLinks.append(base.pagePrev);
				base.helpLinks.append(base.pageNow);
				base.helpLinks.append(base.pageNext);
				base.helpLinks.append(base.pageLast);
				base.slideView.append(base.topInfo);
				base.slideView.append(base.helpLinks);
				base.$el.append(base.slideView);
			}
		};

		base.init();
	};
	
	jQuery.zPaging.defaultOptions = {
		align: "center",
		key: "page",
		movement: 1,
		perPage: 10,
		selectedPage: 1,
		linkWidth: 50,
		linkTitle: "Jump to #no# page",
		viewInfo: true,
		infoTxt: "Page <strong>#now#</strong> of #total#",
		goFirstTxt: "FIRST",
		goPrevTxt: "PREV",
		goNowTxt: "NOW",
		goNextTxt: "NEXT",
		goLastTxt: "LAST"
	};
	
	jQuery.fn.zPaging = function(total, uri, querys, options, cssClass){
		return this.each(function(){
			(new jQuery.zPaging(this, total, uri, querys, options, cssClass));
		});
	};

	jQuery.fn.getzPaging = function(){
		this.data("zPaging");
	};

})(jQuery);