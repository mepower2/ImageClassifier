SpinnerDialog
=============

PhoneGap waiting dialog / progress dialog plugin with spinner for Android, iOS and Windows Phone 8.

> Note: The pluglin is a fork of [Sharinglabs](https://github.com/Sharinglabs/SpinnerDialog) version forked from  [Paldom](https://github.com/Paldom/SpinnerDialog)

## Installation

Use the following command to install the plugin from npmjs repository with with Cordova CLI (requires cordova 5.0+)
```cordova plugin add cordova-plugin-spinnerdialog```  

## Installation - PhoneGap Build 

Add the following line to config.xml: 
```<gap:plugin name="cordova-plugin-spinnerdialog" source="npm" />```

## Methods

- `window.plugins.spinnerDialog.show`
- `window.plugins.spinnerDialog.hide`

## window.plugins.spinnerDialog.show


    window.plugins.spinnerDialog.show([title], [message], [cancelCallback])

- __title__: Spinner title (Android only). Optional. _(String)_
- __message__: Spinner message. Optional. _(String)_
- __cancelCallback__: Callback to invoke when spinner cancel event fired (tap or Android hardware back button event). If set, spinner dialog will be fixed, you should explicitly call `window.plugins.spinnerDialog.hide`. Due to legacy reasons you can provide boolean value (true/false) to set spinner not cancelable. Optional, defaults to `false`. _(Function/Boolean)_


## Supported Platforms

- Android
- iOS
- Windows Phone 8

## Usage

    // Show spinner dialog
    window.plugins.spinnerDialog.show();
    
    // Show spinner dialog with message 
    // Note: spinner dialog is cancelable by default
    window.plugins.spinnerDialog.show(null, "message");
    
    // Set spinner dialog fixed
    window.plugins.spinnerDialog.show(null, null, true);
    
    // Set spinner dialog fixed with callback
    // Note: callback fires on tap events and Android hardware back button click event
    window.plugins.spinnerDialog.show(null, null, function () {console.log("callback");});
    
    // Show spinner dialog with title and message (Android only)
    window.plugins.spinnerDialog.show("title","message");
    
    // Set spinner dialog fixed (cannot be canceled with screen touch or Android hardware button)
    window.plugins.spinnerDialog.show("title","message", true);
    
    // Hide spinner dialog
    window.plugins.spinnerDialog.hide();
    
Note: on Android platform, multiple show calls builds up a stack (LIFO) which means hide will dismiss the last spinner added with show call.
