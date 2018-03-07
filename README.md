# linkme README


[![Travis](https://img.shields.io/travis/Ragnoroct/linkme.svg)](https://github.com/Ragnoroct/linkme)

This VS Code extension allows hyperlinking text based on regular expressions.

## Features

![Linkme Settings Demo](./images/screenshots/example.gif)


## Extension Settings


This extension contributes the following settings:

* `linkme.fieldsOnly`: enable/disable matching words as fields or sections of lines.
* `linkme.rules`: to `[ { "pattern": "", "url": "" } ]`<br>
    Example: `[ { "pattern": "S:(.*)", "https://google.com/search?q=\\1" }`<br>
    Result: `"S:never+gonna+give+you+up"` links to [https://google.com/search?q=never+gonna+give+you+up](https://google.com/search?q=never+gonna+give+you+up)<br>

## Tips
* Test your regular expressions online (google "regex tester" and use the javascript regex engine).
* DON'T set `fieldsOnly` to `false` unless you know what you're doing. Only for users with experience with regular expresssions.
* Make sure to escape special json characters.<br> 
    `/file\.php/` in json is `"file\\.php"`

<!-- ## Release Notes


### 1.0.0

Initial release of linkme -->
