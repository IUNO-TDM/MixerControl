/**
 * System configuration for Angular samples
 * Adjust as necessary for your application needs.
 */
(function (global) {
    System.config({
        paths: {
            // paths serve as alias
            'npm:': 'scripts/'
        },
        // map tells the System loader where to look for things
        map: {
            // our app is within the app folder
            app: 'app',

            // angular bundles
            '@angular/core': 'npm:@angular/core/bundles/core.umd.js',
            '@angular/common': 'npm:@angular/common/bundles/common.umd.js',
            '@angular/compiler': 'npm:@angular/compiler/bundles/compiler.umd.js',
            '@angular/platform-browser': 'npm:@angular/platform-browser/bundles/platform-browser.umd.js',
            '@angular/platform-browser-dynamic': 'npm:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',
            '@angular/http': 'npm:@angular/http/bundles/http.umd.js',
            '@angular/router': 'npm:@angular/router/bundles/router.umd.js',
            '@angular/forms': 'npm:@angular/forms/bundles/forms.umd.js',

            // other libraries
            'rxjs': 'npm:rxjs',
            'angular-in-memory-web-api': 'npm:angular-in-memory-web-api/bundles/in-memory-web-api.umd.js',
            "socket.io-client": 'npm:socket.io-client/dist/socket.io.js',
            'angular2-qrcode': 'npm:angular2-qrcode/angular2-qrcode.js',
            'qrious': 'npm:qrious/dist/umd/qrious.js',
            'angular2-qrscanner': 'npm:angular2-qrscanner',
            '@ng-bootstrap/ng-bootstrap': 'npm:@ng-bootstrap/ng-bootstrap/bundles/ng-bootstrap.js',
            'jquery': 'npm:jquery/dist/jquery.js',
            'bootstrap': 'npm:bootstrap/dist/bootstrap.js',
            'tether': 'npm:tether/dist/js/tether.js'

        },
        // packages tells the System loader how to load when no filename and/or no extension
        packages: {
            app: {
                main: './main.js',
                defaultExtension: 'js'
            },
            rxjs: {
                defaultExtension: 'js'
            },
            "socket.io-client": {
                defaultExtension: 'js'
            }
            ,
            "angular2-qrcode": {
                defaultExtension: 'js'
            }
            ,
            "qrious": {
                defaultExtension: 'js'
            },
            'angular2-qrscanner': {
                main: 'dist/index.js',
                defaultExtension: 'js'
            },
            "jquery": {
                defaultExtension: 'js'
            },
            "bootstrap": {
                defaultExtension: 'js'
            },
            "tether": {
                defaultExtension: 'js'
            },
        }
    });
})(this);
