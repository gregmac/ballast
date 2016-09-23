var gulp = require('gulp');
var icongen = require( 'icon-gen' );
var fs = require('fs-extra');
var packager = require('electron-packager')

gulp.task('package', function(done){
    packager(
        {
            dir: "app",
            arch: "all",
            asar: true,
            download: {
                cache: "temp/downloads"
            },
            icon: "build/icons/icon.ico",
            out: "dist",
            overwrite: true,
            platform: ["win32","linux"],
            tmpdir: "temp",
            version: "1.4.0"
        }, function done_callback (err, appPaths) {
            console.log("Done electron-packager", appPaths); 
            done(err);
        });
});

gulp.task('generate-icons', function(done) {

    fs.ensureDirSync("./build/icons");

    icongen( './assets/logo.svg', './temp', { report: true } )
    .then( (results) => {
        results.forEach( (item) => {
            if (item.endsWith("app.ico")) move(item, "./build/icon.ico")
            else if (item.endsWith("app.icns")) move(item, "./build/icon.icns")
            else if (item.endsWith("favicon.ico")) move(item, "./build/favicon.ico")
            else if (item.endsWith(".png")) move(item, "./build/icons/"+item.replace(/^.*favicon-(\d+).png$/, "$1x$1.png"))
            else console.log("Not sure what to do with {item}");
        });
        done();
    })
    .catch(done);

    function move(oldname, newname) 
    {
        console.log("Moving", oldname, "to", newname);
        return fs.renameSync(oldname, newname);
    }
});

gulp.task('default', ['package']);