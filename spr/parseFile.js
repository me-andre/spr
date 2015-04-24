var _ = require('lodash'),
    fs = require('fs'),
    Comment = require('./Comment');

module.exports = parseFile;

function parseFile(filePath, cb) {
    var buffer = '',
        commentType = null,
        comments = [];

    var fileStream = fs.createReadStream(filePath);
    fileStream.on('data', parseChunk);
    fileStream.on('end', endStream);
    fileStream.resume();

    function parseComments() {
        buffer = '';
        fileStream.close();
        var dependencies = [];
        _.each(comments, function(comment) {
            dependencies.push.apply(dependencies, comment.parse());
        });
        cb(null, dependencies);
    }

    function endComment(string) {
        return commentType === '//' ? string.indexOf('\n') : string.indexOf('*/');
    }

    function parseCommentChunk() {
        var commentEndIndex = endComment(buffer);
        if (commentEndIndex !== -1) {
            var commentContent = buffer.slice(2, commentEndIndex).trim();
            comments.push(new Comment(commentType, commentContent));
            if (commentType === '/*') commentEndIndex += 2;
            commentType = null;
            buffer = buffer.slice(commentEndIndex);
            parseNonCommentChunk();
        }
    }

    function parseNonCommentChunk() {
        buffer = buffer.trimLeft();
        if (buffer.length) {
            if (buffer.length > 1) {
                commentType = startComment(buffer);
                if (!commentType) {
                    parseComments();
                } else {
                    parseCommentChunk();
                }
            } else if (buffer !== '/') {
                parseComments();
            }
        }
    }

    function endStream() {
        if (commentType) parseCommentChunk();
        parseComments();
    }

    function parseChunk(chunk) {
        buffer += chunk;
        if (commentType) {
            parseCommentChunk();
        } else {
            parseNonCommentChunk();
        }
    }

}

function startComment(string) {
    if (string.charAt(0) === '/') {
        var char2nd = string.charAt(1);
        if ('/' === char2nd || '*' === char2nd) {
            return '/' + char2nd;
        }
    }
    return null;
}