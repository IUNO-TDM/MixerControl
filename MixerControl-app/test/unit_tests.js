/**
 * Created by beuttlerma on 02.12.16.
 */
var fs = require('fs');
var path = require('path');


var executeScriptsInPath = function (dirPath) {
    // Loop through all the files in the temp directory
    fs.readdir(dirPath, function (err, files) {
        if (err) {
            console.error("Could not list the directory.", err);
            process.exit(1);
        }

        files.forEach(function (file, index) {
            var filePath = path.join(dirPath, file);

            fs.stat(filePath, function (error, stat) {
                if (error) {
                    console.error("Error stating file.", error);
                    return;
                }

                if (stat.isFile()) {
                    if(filePath === __filename) {
                        return;
                    }
                    require(filePath);
                }

                else if (stat.isDirectory()) {
                    executeScriptsInPath(filePath);
                }

            });
        });
    });
};

executeScriptsInPath(__dirname);