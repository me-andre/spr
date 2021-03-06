# SPRjs

**SPRjs** is a fast and reasonably small script which allows to use static comment-based requires in your front-end code.
Typically it's useful when your app is simple and you want to have full control over your build system: no magic involved.
The format and the behavior of require directives are somewhat borrowed from `sprockets`, a well-known `Ruby` library to manage web assets. `sprockets` in fact does much more than just concatenating javascript, while this library focuses on doing one thing (fast).
When a file depends on another file, place a comment at the top saying `//= require ./another/file`.
The path is relative to the file which contains the directive. You can also require globs `//= require ../dir/*` or require
a file own contents before other dependencies by writing `require_self`.
Let's say, you have the following files:

### main.js

    //= require_self
    //= require models/*
    //= require init

    var models = {};
    function main () { /* ... */ }

### init.js

    document.addEventListener('DOMContentLoaded', main);

### api.js

    var api = { /* ... */ };

### models/Post.js

    //= require ../api
    models.Post = function () { /* ... */ }
    models.Post.prototype.request = function () { api.requestPost() };

The result of calling `sprjs('/path/to/main.js', function callback(err, files) { })` would be invocation of the `callback` function with
`files = ['main.js', 'api.js', 'models/Post.js', 'init.js']`

Please note that `spr` processes directives which are found before any code.

## Usage

1. `npm i sprjs`
2. `var sprjs = require('sprjs'); sprjs('/path/to/main.js', function callback(err, files) { });`

## Gulp

1. Take a look at [gulp-spr](https://github.com/me-andre/gulp-spr) if you use `gulp` as your build environment.