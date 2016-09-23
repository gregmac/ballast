var gulp = require('gulp');

gulp.task('package', function(cb){
    var packager = require('electron-packager')
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
            cb(err);
        });
});

gulp.task('default', ['package']);