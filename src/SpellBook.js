/*
SpellBook - hui's text editor

---- Forked from original work ----
+ Markdown Editor by Nacho and Carlos Coloma
+ Showdown by John Fraser
+ Markdown by John Gruber

The license is MIT. Use it however you please.

Options:
* resources: JSON object with all the i18n entries
* buttons: a list of buttons to use
* value: The initial value of the textarea
* historyRate: the amount of time (in milliseconds) without user input that triggers a new entry in the history
* renderRate: the amount of time (in milliseconds) without user input that triggers a re-render HTML
*/

(function($){
	
/*
 Mathias Bynens proposal to follow changes to a textarea.
 To check what this does, see: http://mathiasbynens.be/notes/oninput
 */
$.fn.input = function(fn) {
  var $this = this;
  if (!fn) {
    return $this.trigger('keydown.input');
  }
  return $this.bind({
    'input.input': function(event) {
      $this.unbind('keydown.input');
      fn.call(this, event);
    },
    'keydown.input': function(event) {
      fn.call(this, event);
    }
  });
};

$.fn.markdownEditor = function(options) {
	
	options = $.extend({
		historyRate: 2000,
		screenSplit: "tall",
		leftSide: 0,
		rightSide: 0,
		fileMenu: 0,
		settingsMenu: "spellbook_settings",
		TipIt:0,
		renderRate: 300,
		buttons: [ 'chevron-down', 'cog', 'cloud', 'font', 'bold', 'italic', 'quote-right', 'beaker', 'link', 'picture', 'list-ul', 'reply', 'share-alt', 'info-sign' ],
		resources: {
			'icon-bold': 'Bold',
			'icon-italic': 'Italic',
			'icon-link': 'Create link',
			'icon-quote-right': 'Quote',
			'icon-beaker': 'Code',
			'icon-picture': 'Add image',
			'icon-font': 'Header',
			'icon-list-ul': 'Bullet list',
			'icon-reply': 'Undo',
			'icon-share-alt': 'Redo',
			'icon-info-sign': 'Help',
			'icon-ok': 'Accept',
			'icon-remove': 'Cancel'
		},
		funbuttons: {
			'chevron-down':  'Editor Toggle',
			'icon-cloud':  'File Menu',
			'icon-cog':  'Settings'
		}
	}, options);
	
	var 

		// history of text modifications (String [])
		history = [],

		// current step in history
		hcursor = 0,

		// ShowDown converter
		converter = new Showdown.converter(),

		// creates the HTML code for a button
		createButton = function(button,tbox) {
			if(button=="chevron-down"){
				//If Mobile Toggle Need Different than editor toolbar stuff.
				if(tbox=="true"){
					return '<a class="button button-mobile TBBtn"><span class="fa-icon icon-chevron-down"></span></a>';
				} else {
					return '<a class="button button-mobile"><span class="fa-icon icon-chevron-down"></span></a>';
				}
			} else {
				var name = 'icon-' + button;
				var theid = 'Magick-' + button; //Really a Class
				var buttonTitle;
				if(options.funbuttons[name]){
					//Buttons that arnt used for text editing. Save, Export etc.
					buttonTitle = options.funbuttons[name];
					theid += " "+"FunBtn";
				} else {
					buttonTitle = options.resources[name];
				}
				/* MATCHED BUTTON PAIRS */
				/* 
				*
				* Right now you have to custom configure this with the code. 
				* TODO: Pass array w/ left right or middle options.
				*
				*/
				if(button == "bold"){ theid += " "+"left"; }
				if(button == "italic"){ theid += " "+"right"; }
				if(button == "quote-right"){ theid += " "+"left"; }
				if(button == "beaker"){ theid += " "+"right"; }
				if(button == "reply"){ theid += " "+"left"; }
				if(button == "share-alt"){ theid += " "+"right"; }
				
				if(button == "ok"){
					return '<a class="button action ' + theid + '" title="' + buttonTitle + '"><span class="fa-icon icon-' + button + '"></span><span class="label">Accept</span></a>';
				}
				if(button == "remove"){
					return '<a class="button action ' + theid + '" title="' + buttonTitle + '" style="float:right;"><span class="fa-icon icon-' + button + '"></span><span class="label">Remove</span></a>';
				}
				
				//Move File Menu To Right Side of the Screen
				if(button == "cloud"){ 
					theid += " "+"FileMenu";
					return '<a class="button action ' + theid + '" title="' + buttonTitle + '"><span class="fa-icon red icon-' + button + '"></span><span class="label red">File</span></a>';
				}
				if(button == "cog"){ 
					theid += " "+"CogMenu";
					return '<a class="button ' + theid + '" title="' + buttonTitle + '"><span class="fa-icon icon-' + button + '"></span></a>';
				}
				
				if(options.TipIt!=0){
					return '<a class="button ' + theid + " "+ options.TipIt + '" title="' + buttonTitle + '"><span class="fa-icon icon-' + button + '"></span></a>';
				} else {
					return '<a class="button ' + theid + '" title="' + buttonTitle + '"><span class="fa-icon icon-' + button + '"></span></a>';
				}
			}
		}
		//Cookie Check
		var viewCookie = $.cookie('spellbook_vc'); // => "the_value"
		if(viewCookie!=undefined){
			options.screenSplit=viewCookie;
		}
		
		var rst = (new Date).getTime();
		var containerthing;
		if(options.leftSide!=0){
			//$("body").css("overflow","hidden");
			
			// container of the whole thing
			if(options.screenSplit=="tall"){
				startSplit = "";
			} 
			if(options.screenSplit=="wide"){
				startSplit = "splitscreen";
			}
			if(options.screenSplit=="full"){
				startSplit = "fullscreen";
			}
			
			containerthing = '<div class="markdown-container"><div id="'+options.topSide+'"><div class="markdown-ToolBox"><div class="markdown-toolbar"></div></div></div><div id="'+options.leftSide+'" class="markdown-lefty '+startSplit+'"><textarea class="markdown-editor" id="'+rst+'"></textarea></div><div id="'+options.rightSide+'" class="markdown-righty '+startSplit+'"><div class="markdown-preview"></div><div class="push fixBlock"></div></div></div>';
			containerthing += '<div class="spellbook-fulltoggle"><span class="fa-icon icon-fullscreen icon-2x"></span></div>';
			
			$container = $(containerthing),
			$toolbar = $container.find('.markdown-toolbar'),
			$toolbox = $container.find('.markdown-ToolBox'),
			$editor = $container.find('.markdown-editor'),
			$preview = $container.find('.markdown-preview');
		} else {
			// container of the whole thing
			$container = $('<div class="markdown-container"><div class="markdown-toolbar"></div><textarea class="markdown-editor" id="'+rst+'"></textarea><div class="markdown-preview"></div></div>'),
			$toolbar = $container.find('.markdown-toolbar'),
			$editor = $container.find('.markdown-editor'),
			$preview = $container.find('.markdown-preview');
		}
		
	/*
		getSelection extracted from fieldSelection jQuery plugin by Alex Brem <alex@0xab.cd>
	*/
	var e = $editor[0],

	/*
		@return if block == true, the start of the line containing the current selection
	*/
	getStart = function(value, start, block) {
		if (!block) return start;
		while (start > 1) {
			if (value[start - 1] == '\n')
				break;
			start--;
		}
		return start;
	},

	getEnd = function(value, end, block) {
		if (!block) return end;
		while (end < value.length - 1) {
			if (value[end] == '\n')
				break;
			end++;
		}
		return end;
	},

	/*
		get the current selection
	*/
	getSelection = 

		/* mozilla / dom 3.0 */
		('selectionStart' in e && function(block) { 
			var start = getStart(e.value, e.selectionStart, block);
			var end = getEnd(e.value, e.selectionEnd, block);
			var l = end - start;
			return { 
				start: start, 
				end: end, 
				length: l, 
				text: e.value.substr(start, l) 
			};
		}) ||

		/* exploder */
		(document.selection && function() {

			e.focus();

			var r = document.selection.createRange();
			if (r === null) {
				return { 
					start: 0, 
					end: e.value.length, 
					length: 0 
				}
			}

			var re = e.createTextRange();
			var rc = re.duplicate();
			re.moveToBookmark(r.getBookmark());
			rc.setEndPoint('EndToStart', re);

			// TODO: missing the getStart() invocation to select entire lines of text

			return { 
				start: rc.text.length, 
				end: rc.text.length + r.text.length,
				length: r.text.length, 
				text: r.text 
			};
		}) ||

		/* browser not supported */
		function() { return null; };

	/* 
	* WINDOW RESIZE AND VIEWPORT CONTROL FUNCTION
	*/
	var detectViewPort = function(){
		var viewPortWidth = $(window).width();
		
		if($(".markdown-lefty").hasClass("splitscreen")!=true){
		    $("body").css("overflow","auto");
			var newHeight = jQuery(window).height() - jQuery("#"+options.topSide).height();
			finalHeight = newHeight - 4;
			jQuery("#"+rst).height(finalHeight);
			var halfTWH = jQuery(window).height() - jQuery("#"+options.topSide).height();
			jQuery("#"+options.leftSide).height(halfTWH);
			jQuery("#"+options.rightSide).height(halfTWH);
			console.debug(halfTWH);
		} else {
			//topbar height
			//left = 50% - tbh
			//right = 50% - thb + top positon = 50% + tbh;
			var TotalHeight = jQuery(window).height();
			var tbh = jQuery("#"+options.topSide).height();
			var halfTWH = TotalHeight / 2;
			jQuery("#"+options.leftSide).height(halfTWH-tbh);
			jQuery("#"+options.rightSide).height(halfTWH-5);
			jQuery("#"+options.rightSide).css("top",halfTWH+5);
			$("body").css("overflow","hidden");
		}

	    if (viewPortWidth < 800){
			//console.debug("x2 full_split");
			if(jQuery("#"+options.rightSide).hasClass("fullscreen")!=true){
				CleanViewPort();
				$("#"+options.rightSide).hide();
				$(".FullSplit").addClass("on");
				$(".spellbook-fulltoggle").addClass("fullscreen");
				$("#"+options.leftSide).addClass("fullscreen");
				$("#"+options.rightSide).addClass("fullscreen");
			}
	    } else {
	    	//Large Screen
			if(jQuery(".markdown-ToolBox").hasClass("PanelOpen")==true){
				jQuery(".markdown-ToolBox").removeClass("PanelOpen");
				jQuery("#"+options.leftSide).removeClass("DropDown");
				jQuery("#"+options.topSide).removeClass("DropDown");
			}
			if(jQuery("#"+options.rightSide).hasClass("fullscreen")==true){
				var vsCookie = $.cookie('spellbook_vc');
				//console.debug(vsCookie);
				if(vsCookie != undefined && vsCookie != "full"){
					AdjustViewPort(vsCookie);
				}
			}
	    }
	};

	/*
	 * replaceSelection extracted from fieldSelection jQuery plugin by Alex Brem <alex@0xab.cd>
	 */
	var replaceSelection = 

		/* mozilla / dom 3.0 */
		('selectionStart' in e && function(text, block) { 
			var start = getStart(e.value, e.selectionStart, block);
			var end = getEnd(e.value, e.selectionEnd, block);
			e.value = e.value.substr(0, start) + text + e.value.substr(end, e.value.length);
			e.selectionStart = start;
			e.selectionEnd = start + text.length;
			e.focus();
		}) ||

		// TODO: missing the getStart() invocation to select entire lines of text
		/* exploder */
		(document.selection && function(text) {
			e.focus();
			document.selection.createRange().text = text;
		}) ||

		/* browser not supported */
		function(text) {
			e.value += text;
		};

	/**
		Pushes a new entry in the history.
		New entries are pushed only 
	*/
	var historyID = 0;
	var pushHistory = function() {
		clearTimeout(historyID);
		historyID = setTimeout(function() {
			if (e.value != history[hcursor]) {
				history[++hcursor] = e.value;
				// console.log("push " + hcursor + " " + e.value);
				if (history.length > hcursor + 1) { // if 'undo' and then write something, replace the future entries
					history = history.slice(0, hcursor + 1);
					$redoBtn.attr('disabled', '');
				}
			}
		}, options.historyRate);
		$undoBtn.removeAttr('disabled');
		renderHTML();
	}

	/**
		undo an entry in the history
	*/
	var popHistory = function() {
		if (hcursor) {
			e.value = history[--hcursor];
			// console.log("pop " + hcursor + " " + e.value);
			$redoBtn.removeAttr('disabled');
			renderHTML();
		} 
		hcursor || $undoBtn.attr('disabled', '');
	}

	/**
		redo an entry in the history 
	*/
	var redoHistory = function() {
		if (hcursor < history.length - 1) {
			e.value = history[++hcursor];
			// console.log("redo " + hcursor + " " + e.value);
			if (hcursor === history.length - 1)
				$redoBtn.attr('disabled', '');
			renderHTML();
			$undoBtn.removeAttr('disabled');
		}
	}

	/**
		Update the preview container with fresh user input
		@param sync {boolean} true to do the render synchronously. Otherwise, the call will be throttled
	*/
	var renderID = 0;
	var renderHTML = function(sync) {
		if (!sync) {
			clearTimeout(renderID);
			renderID = setTimeout(function() {
				$preview.html(converter.makeHtml(e.value));
				$editor.trigger('md.change', e);
			}, options.renderRate);
		} else {
			$preview.html(converter.makeHtml(e.value));
		}
	}
	
	var BrowserDetect = 
	{
	    init: function () 
	    {
	        this.browser = this.searchString(this.dataBrowser) || "Other";
	        this.version = this.searchVersion(navigator.userAgent) ||       this.searchVersion(navigator.appVersion) || "Unknown";
	    },

	    searchString: function (data) 
	    {
	        for (var i=0 ; i < data.length ; i++)   
	        {
	            var dataString = data[i].string;
	            this.versionSearchString = data[i].subString;

	            if (dataString.indexOf(data[i].subString) != -1)
	            {
	                return data[i].identity;
	            }
	        }
	    },

	    searchVersion: function (dataString) 
	    {
	        var index = dataString.indexOf(this.versionSearchString);
	        if (index == -1) return;
	        return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
	    },

	    dataBrowser: 
	    [
	        { string: navigator.userAgent, subString: "Chrome",  identity: "Chrome" },
	        { string: navigator.userAgent, subString: "MSIE",    identity: "Explorer" },
	        { string: navigator.userAgent, subString: "Firefox", identity: "Firefox" },
	        { string: navigator.userAgent, subString: "Safari",  identity: "Safari" },
	        { string: navigator.userAgent, subString: "Opera",   identity: "Opera" }
	    ]

	};
	BrowserDetect.init();

	// insert buttons
	$.each(options.buttons, function(index, button) {
		if(button=="chevron-down"){
			$toolbar.append(createButton(button));
			$toolbox.append(createButton(button,"true"));
		} else if (button=="cloud"||button=="cog"){
			$toolbox.append(createButton(button));
		} else {
			$toolbar.append(createButton(button));
		}
	});
	var $undoBtn = $toolbar.find('.icon-reply');
	var $redoBtn = $toolbar.find('.icon-share-alt');
	
	/**
		Add The Default Settings Menu
	*/
	var addSettingsMenu = function() {
		var settingsHTML = "<div id='"+options.settingsMenu+"'><div id='spellbook_settings_inner'><div class='p10'>";
		settingsHTML += '<p class="m0 p0 L whiteText" style="padding-top:3px;">&nbsp;<span class="fa-icon icon-cog" style="padding:3px;margin:2px;"></span>&nbsp;Editor Settings</p><a class="button settings_toggle" style="float:right;margin:2px 4px 0px 0px;"><span class="fa-icon icon-arrow-up" style="padding:2px;margin:2px"></span></a><div class="push" style="height:10px;"></div>';
		
		//Editor Font Size Buttons
		settingsHTML += '<div id="SettingsBar"><label for="TheNoteTitle" class="m0 p0 whiteText">Editor Text Size</label><div class="push" style="height:2px;"></div><a class="button left FontButton FBF" id="LessFont"><span class="fa-icon icon-minus-sign"></span></a><a id="RESETFont" class="button middle FontButton"><span class="fa-icon icon-text-height"></span><span class="label">Size</span></a><a id="MoreFont" class="button right FontButton"><span class="fa-icon icon-plus-sign"></span></a><div class="push" style="height:2px;"></div></div>';
		
		//Viewport Adjustment
		settingsHTML += '<div id="ViewBar" class="smallHide"><p class="m0 p0 L whiteText" style="padding-top:13px;">&nbsp;<span class="fa-icon icon-columns" style="padding:3px;margin:2px;"></span>&nbsp;Display Mode</p><span class="push" style="height:2px;"></span><a id="column_split" href="#" class="button ViewButton ColumnSplit"><span class="label activeD">Vertical</span></a><a id="screen_split" href="#" class="button ViewButton ScreenSplit"><span class="label">Horizontal</span></a><a id="full_split" href="#" class="button ViewButton FullSplit"><span class="label">Full Page</span></a><span class="push" style="height:2px;"></span></div>';
		
		settingsHTML += '</div></div></div>';
		return settingsHTML;
	};
	/**
		asks the user for a link title and href
	*/
	var addLink = function(callback) {
		if(BrowserDetect.browser == 'Explorer' && BrowserDetect.version <= 9){
			var selection = document.selection.createRange();
		} else {
			var selection = getSelection().text.replace(/\n/g, '').trim();
		}
		
			
			var linkForm = '<form class="md-link-form" action="#"><div class="push" style="height:5px"></div><label>Add a New Link</label><div class="push" style="height:5px"></div>' +
				'<input placeholder="Title" type="text" class="md-input md-title"><div class="push" style="height:5px"></div>' +
				'<input placeholder="http://" type="url" class="md-input md-href"><div class="push" style="height:10px"></div>' +
				createButton('ok') + createButton('remove') +
			'<div class="push" style="height:10px"></div></form>';
			
			/*
			var cancel = function() {
				$linkForm.remove();
				$toolbar.show();
				return false;
			};
			var accept = function() {
				var $href = $linkForm.find('.md-href'),
					$title = $linkForm.find('.md-title'),
					href = $href.val(),
					title = $title.val() || href
				;
				replaceSelection(callback(title, href));
				pushHistory();
				$linkForm.remove();
				$toolbar.show();
				return false;
			};
			*/
		$("#SpellBookNotes").html(linkForm);
		//$toolbar
		//	.hide()
		//	.after($linkForm);
			
		/*$linkForm
			.on('click', '.icon-ok', accept)
			.on('click', '.icon-minus-sign', cancel)
			.on('keyup', '.md-input', function(e) {
				if (e.keyCode === 13)
					accept();
				else if (e.keyCode === 27)
					cancel();
			});*/
		
		if (!selection || /^http(s?):\/\//.exec(selection)) {
			$("#SpellBookNotes .md-link-form").find('.md-href').val(selection);
			$("#SpellBookNotes .md-link-form").find('.md-title').focus()
		} else {
			$("#SpellBookNotes .md-link-form").find('.md-title').val(selection);
			$("#SpellBookNotes .md-link-form").find('.md-href').focus()
		}
		
		jQuery.facebox({ div: '#SpellBookNotes' });
		clickFBLinks(callback);
	};
	function clickFBLinks(callback){
		$("#facebox .Magick-ok").on("click",function(ev){
			ev.preventDefault();
			var title = $("#facebox .md-title").val();
			var href = $("#facebox .md-href").val();
			replaceSelection(callback(title, href));
			pushHistory();
			$.facebox.close();
		});
		$("#facebox .Magick-remove").on("click",function(ev){
			ev.preventDefault();
			$.facebox.close();
		});
	}

	/**
		options: 
		- regex: Pattern to check if the mark must be set or removed
		- modify: Callback to modify the selection
		- undo: Callback to undo this modification
		- block: use entire lines no matter what is selected
	*/
	var updateSelection = function(o) {
		var selection = getSelection(o.block).text;
		// for commands affecting a single line, ignore multiline selections
		if (!o.block && /\n/.exec(selection))
			return;
		var parts = o.regex.exec(selection);
		var value = !parts? o.modify(selection) :
			o.undo? o.undo(selection, o) : 
			parts[1];
		replaceSelection(value, o.block);
	};

	var commands = [
		{
			cmd: 'bold',
			handler: function() {
				updateSelection({
					modify: function(value) {
						return '**' + value.trim() + '**';
					},
					regex: /^\*\*(.*)\*\*$/
				});
				pushHistory();
			}
		},
		{
			cmd: 'italic',
			handler: function() {
				updateSelection({
					modify: function(value) {
						return '*' + value.trim() + '*';
					},
					regex: /^\*((\*\*)?([^*]*)(\*\*))?\*$/
				});
				pushHistory();
			}
		},
		{
			cmd: 'link',
			shortcut: '⌘+k, ctrl+k',
			handler: function() {
				addLink(function(title, href) {
					return '[' + title + '](' + href + ')';
				});
			}
		},
		{
			cmd: 'beaker',
			shortcut: 'shift+⌘+p, shift+ctrl+p',
			handler: function() {
				updateSelection({
					modify: function(value) {
						return '`' + value + '`';
					},
					regex: /^`([^`]*)`$/
				});
				pushHistory();
			}
		},
		{
			cmd: 'quote-right',
			shortcut: '⌘+\', ctrl+\'',
			handler: function() {
				updateSelection({
					modify: function(value) {
						return '> ' + value.replace(/\n/g, '\n> ');
					},
					undo: function(value) {
						return value.replace(/(^|\n)>[ \t]*(.*)/g, "$1$2");
					},
					regex: /((^|\n)>(.*))+$/,
					block: true
				});
				pushHistory();
			}
		},
		{
			cmd: 'picture',
			shortcut: 'shift+⌘+i, shift+ctrl+i',
			handler: function() {
				addLink(function(title, href) {
					return '![' + title + '](' + href + ' "' + title + '")';
				});
			}
		},
		{
			cmd: 'font',
			handler: function() {
				updateSelection({
					modify: function(value) {
						return '#' + value;
					},
					regex: /^#(.*)$/,
					block: true
				});
				pushHistory();
			}
		},
		{
			cmd: 'list-ul',
			shortcut: 'shift+⌘+l, shift+ctrl+l',
			handler: function() {
				updateSelection({
					modify: function(value) {
						return '* ' + value.replace(/\n/g, '\n* ');
					},
					undo: function(value) {
						return value.replace(/^[\s\t]*\*[ \t]*/mg, "");
					},
					regex: /^([\s\t]*\*.*)*$/,
					block: true
				});
				pushHistory();
			}
		},
		{
			cmd: 'reply', //really undo
			shortcut: '⌘+z, ctrl+z',
			handler: popHistory
		},
		{
			cmd: 'share-alt', //really redo
			shortcut: '⌘+y, ctrl+y',
			handler: redoHistory
		},
		{
			cmd: 'info-sign',
			shortcut: 'shift+⌘+h, shift+ctrl+h',
			handler: function() {
				jQuery.facebox({ div: '#markup_help_box' });
			}
		},
		{
			cmd: 'chevron-down',
			//shortcut: 'shift+⌘+h, shift+ctrl+h',
			handler: function() {
				//console.debug("this");
				if(jQuery(".markdown-ToolBox").hasClass("PanelOpen")==true){
					jQuery(".markdown-ToolBox").removeClass("PanelOpen");
					jQuery("#"+options.leftSide).removeClass("DropDown");
					jQuery("#"+options.topSide).removeClass("DropDown");
				} else {
					jQuery(".markdown-ToolBox").addClass("PanelOpen");
					jQuery("#"+options.leftSide).addClass("DropDown");
					jQuery("#"+options.topSide).addClass("DropDown");
				}
			}
		},
		{
			//Simple Hidden Panel Toggle. You would then have a Div with this name in the HTML
			//And you can easily add whatever hooks you want for export or saving to your app
			cmd: 'cloud',
			shortcut: '⌘+s, ctrl+s',
			handler: function() {
				jQuery("#"+options.fileMenu).toggleClass("FileShow");
			}
		},
		{
			//Simple Hidden Panel Toggle. You would then have a Div with this name in the HTML
			//And you can easily add whatever hooks you want for export or saving to your app
			cmd: 'cog',
			shortcut: '⌘+,, ctrl+,',
			handler: function() {
				//console.debug(options.settingsMenu);
				jQuery("#"+options.settingsMenu).toggleClass("FileShow");
			}
		}
	];
	
	// disable the default behaviour of filtering key bindings when we are inside the textarea
	key.filter = function (event){
		var tagName = (event.target || event.srcElement).tagName;
		return !(tagName == 'INPUT' || tagName == 'SELECT');
	}

	// asigna handler para cada comando
	for (var i = 0; i < commands.length; i++) {
		var action = commands[i],
			cmd = action.cmd,
			handler = action.handler
		;
		
		if(cmd!='chevron-down' && cmd!='cloud'){
			// mouse
			$toolbar.on('click', '.icon-' + cmd, handler);
			
			// keyboard
			key(action.shortcut || '⌘+' + cmd + ', ctrl+' + cmd, 'markdown', handler);
		}
		
		// Non Markdown Editor Buttons. (Save, Menus etc)
		if(cmd=='chevron-down'){
			// mobile menu
			$toolbox.on('click', '.icon-chevron-down', handler);
		} else if(cmd=='cloud' || cmd=='cog'){
			$toolbox.on('click', '.icon-'+ cmd, handler);
			key(action.shortcut || '⌘+' + cmd + ', ctrl+' + cmd, 'markdown', handler);
		}
	}

	$editor
		.focusin(function() {
			// set markdown scope for key bindings
			key.setScope('markdown');
		})
		.focusout(function() {
			// set default scope
			key.setScope();
		})
	;

	// this for testing only
	if (options.internals) {
		var i = options.internals;
		i.pushHistory = pushHistory;
		i.popHistory = popHistory;
		i.history = history;
	}

	// insert current value
	options.value && $editor.val(options.value);
	$editor.input(pushHistory);
	
	// initialize history
	history[hcursor] = e.value;
	renderHTML(true);
	$redoBtn.attr('disabled', '')
	$undoBtn.attr('disabled', '')

	this.html($container);

	if(options.TipIt!=0){
		jQuery("."+options.TipIt).tipTip();
	}

	if(options.fileToggle){
		/* Save File Buttons */
		var filetoggles = ".FileMenu, ."+options.fileToggle;
		jQuery(filetoggles).on("click",function(ev){
			ev.preventDefault();
			jQuery("#"+options.fileMenu).toggleClass("FileShow");
			return false;
		});
	}
	
	var FontBase = 14;
	function SizeFont(fCMD){
		var theEditorID = "#"+rst;
		//console.debug(theEditorID);
		var PXSize = jQuery(theEditorID).css("font-size");
		var NowSize = parseInt(PXSize, 10);
		//console.debug(NowSize);
		if(fCMD=="RESETFont"){
			NowSize = FontBase;
			jQuery(theEditorID).css("font-size",FontBase);
		}
		if(fCMD=="LessFont"){
			NowSize--;
			jQuery(theEditorID).css("font-size",NowSize);
		}
		if(fCMD=="MoreFont"){
			NowSize++;
			jQuery(theEditorID).css("font-size",NowSize);
		}
		
		$.cookie('spellbook_fs', NowSize, { expires: 364, path: '/' });
		detectViewPort();
	}
	
	function CleanViewPort(){
		if($("#"+options.leftSide).hasClass("fullscreen")==true){
			$(".spellbook-fulltoggle").removeClass("fullscreen");
			$("#"+options.leftSide).removeClass("fullscreen");
			$("#"+options.rightSide).removeClass("fullscreen");
		}
		if($("#"+options.leftSide).hasClass("splitscreen")==true){
			$("#"+options.leftSide).removeClass("splitscreen");
			$("#"+options.rightSide).removeClass("splitscreen");
		}
		if($("#"+options.leftSide).is(":visible")!=true){
			$("#"+options.leftSide).show();
		}
		if($("#"+options.rightSide).is(":visible")!=true){
			$("#"+options.rightSide).show();
		}
		$(".ViewButton").removeClass("on");
	}
	
	function fixColumnHeights(){
		$("body").css("overflow","auto");
		var tbh = jQuery("#"+options.topSide).height();
		var halfTWH = jQuery(window).height() - tbh;
		jQuery("#"+options.leftSide).height(halfTWH);
		jQuery("#"+options.rightSide).height(halfTWH);
		jQuery("#"+options.rightSide).css("top",tbh);
		console.debug("fixed column height: "+halfTWH);
	}
	
	var AVPTimer = 0;
	function AdjustViewPort(tmode){
		if(AVPTimer==0){
			AVPTimer++;
			CleanViewPort();
			//ColumnSplit ScreenSplit FullSplit
			if(tmode == "screen_split" || tmode == "wide"){
				$(".ScreenSplit").addClass("on");
				$("#"+options.leftSide).addClass("splitscreen");
				$("#"+options.rightSide).addClass("splitscreen");
				//Fix Editor Height
				var newwriteheight = ($(window).height()*0.5) - $("#"+options.topSide).height() - 5;
				$(".markdown-editor").css("height",newwriteheight);
			} else if(tmode=="column_split" || tmode == "tall"){
				//Naturally how SpellBook is. no additionall classes need.
				$(".ColumnSplit").addClass("on");
				fixColumnHeights();
			} else if(tmode=="full_split" || tmode == "full"){
				$("#"+options.rightSide).hide();
				$(".FullSplit").addClass("on");
				$(".spellbook-fulltoggle").addClass("fullscreen");
				$("#"+options.leftSide).addClass("fullscreen");
				$("#"+options.rightSide).addClass("fullscreen");
				fixColumnHeights();
			}
			detectViewPort();
			AVPLimit = setTimeout(function(){ AVPTimer = 0; },1000);
		}
	}
	
	if(options.settingsMenu=="spellbook_settings"){
		$toolbox.append(addSettingsMenu);
		jQuery(".settings_toggle").on("click",function(ev){
			ev.preventDefault();
			jQuery("#spellbook_settings").toggleClass("FileShow");
			return false;
		});
		jQuery(".FontButton").on("click",function(ev){
			ev.preventDefault();
			var fontCMD = $(this).attr("id");
			SizeFont(fontCMD);
			return false;
		});
	}
	
	jQuery(".ViewButton").removeClass("on");
	//ColumnSplit ScreenSplit FullSplit
	if($("#"+options.leftSide).hasClass("splitscreen")==true){
		jQuery(".ScreenSplit").addClass("on");
	} else if($("#"+options.leftSide).hasClass("fullscreen")) {
		jQuery(".FullSplit").addClass("on");
	} else {
		jQuery(".ColumnSplit").addClass("on");
	}
	
	jQuery(".ViewButton").on("click",function(ev){
		ev.preventDefault();
		var theid = $(this).attr("id");
		AdjustViewPort(theid);
		var thecookie; 
		if(theid=="screen_split"){
			thecookie = "wide"; 
		} else if(theid=="column_split"){ 
			thecookie = "tall";
		} else if(theid=="full_split"){
			thecookie = "full";
		}
		//console.debug(thecookie);
		$.cookie('spellbook_vc', thecookie, { expires: 364, path: '/' });
	});
	$(".spellbook-fulltoggle").on("click",function(ev){
		ev.preventDefault();
		if($("#"+options.rightSide).is(":visible")==true){
			$("#"+options.rightSide).hide();
			$("#"+options.leftSide).show();
		} else {
			$("#"+options.leftSide).hide();
			$("#"+options.rightSide).show();
		}
	});
	
	//Setup Empty Div to Modify things on the fly.
	jQuery(".markdown-container").append("<div class='none' id='SpellBookNotes'></div>");
	
	var fsCookie = $.cookie('spellbook_fs');
	if(fsCookie!=undefined){
		//console.debug(fsCookie);
		jQuery('.markdown-editor').css("font-size",fsCookie+"px");
	}
	var vsCookie = $.cookie('spellbook_vc');
	if(vsCookie==undefined){
		////console.debug("tall");
		vsCookie="tall";
	//	AdjustViewPort("full_split");
	}
	
	AdjustViewPort(vsCookie);
    //setTimeout("detectViewPort",2000);
	jQuery(window).resize(function () {
	   detectViewPort();
	});
}

})(jQuery);
