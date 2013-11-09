#Magick in your Markdown

Magick Mirror is a very minimal markdown editor. It uses hui and jQuery to acheive a responsive layout. The plugin will function on smartphones, tablets, and any modern web browser. supports microsoft IE8 and up.

This is an hui plugin, and requires that jQuery and hui both be loaded.

## Magick Mirror Details
Markdown Editor that is based on Showdown, but **NOT** on WMD. The idea is to make a lightweight, jQuery-based editor with most of the features but none of the baggage. The result is an uncompressed 8KB **featherweight** file. 

You can see a live demo [here](http://hui.huement.com/labs/MagickMirror).

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

####The default is 
`[ 'font', 'bold', 'italic',    
   'quote-right', 'cloud', 'link',    
   'picture', 'list-ul', 'reply',    
   'share-alt', 'info-sign' ]`   
    
    
## Bugs

A'plenty. But we are using it for a real site, and so far are quite happy.

There is some confusion with the buttons. We kept the native font-awesome css style sheet intact, which led to a couple commands not having the correct button. For instance, code formatting is called with the "cloud" command. If you look in the source code everything is correctly labeled to avoid any confusion.