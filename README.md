#Magick in your Markdown

![Image](https://raw.github.com/johnny13/SpellBook/master/SpellBook-Preview.png)
&nbsp;&nbsp;

SpellBook is a very minimal markdown editor. It uses hui and jQuery to acheive a responsive layout. The plugin will function on smartphones, tablets, and any modern web browser. supports microsoft IE8 and up.

SpellBook is an hui plugin, and requires that jQuery and hui both be loaded.

## SpellBook Details
Markdown Editor that is based on Showdown, but **NOT** on WMD. The idea is to make a lightweight, jQuery-based editor with most of the features but none of the baggage. The result is an tiny 12KB **compressed** javascript file. 

You can see a live demo [here](http://hui.huement.com/labs/SpellBook).

## Features

* All the typical buttons are there: bold, italics, etc.
* Undo and redo
* Keyboard shortcuts
* Internationalized button (hover) titles
* Markdown Syntax Help modal window
* Retina support &amp; font-face icons

## The options

Essentially you configure what toolbar buttons you would like present, and where the default content would come from. Typically you would then hook in your apps functions to load and save the textarea input. 

* **historyRate**: the number of milliseconds to introduce entries in the "undo" registry. If the user starts writing, it will wait this amount of time before introducing a new entry in the history. Default is 2000.
* **renderRate**: the same concept applied to rendering preview HTML. The default is 300.
* **resources**: the list of labels to use, in case you need i18n.
* **buttons**: the list of buttons to display. 
* **fbuttons**: function buttons not related to markdown formating (save, export etc)
* **Layout Options**: Top, Left & Right Side Settings. Set default splitscreen view.
* **Dropdown Menus**: Editor Settings and a File Menu
* **ToolTips**: Add tooltip helpers to any toolbar button. 

####Markdown Commands 
These are the various toolbar buttons you can add. These buttons only deal with editing markdown text.
<pre>
icon-bold         : Bold  
icon-italic       : Italic  
icon-link         : Create link  
icon-quote-right  : Quote  
icon-cloud        : Code  
icon-picture      : Add image  
icon-font         : Header  
icon-list-ul      : Bullet list  
icon-reply        : Undo  
icon-share-alt    : Redo  
icon-info-sign    : Help  
</pre>
    
    
## Bugs

A'plenty. But we are using it for a real site, and so far are quite happy.

There is some confusion with the buttons. We kept the native font-awesome css style sheet intact, which led to a couple commands not having the correct button. For instance, code formatting is called with the "cloud" command. If you look in the source code everything is correctly labeled to avoid any confusion.