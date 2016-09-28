var gulp = require('gulp');
var icongen = require( 'icon-gen' );
var fs = require('fs-extra');
var packager = require('electron-packager')
var jsonModify = require('gulp-json-modify');
var version = null;

// get version based on git tag (if applicable)
var tagVersion = process.env.APPVEYOR_REPO_TAG_NAME || process.env.TRAVIS_TAG || process.env.CIRCLE_TAG;
if (tagVersion) {
    if (match = tagVersion.match(/v?(\d+\.\d+(?:\.\d+)?)/)) {
        version = match[1];
    } else {
        console.log(`Found tag, but doesn't look like a version number: ${tagVersion}`);
    }
}

// read version from package.json 
if (version == null) {     
    var packageJson = fs.readJsonSync('package.json');
    if (!packageJson.version.match(/\d+\.\d+(\.\d+)?/)) {
        throw `Invalid version format in package.json: ${packageJson.version}`;
    }
    version = packageJson.version;
}

// get build number from CI environment and append to version 
var buildNumber = process.env.APPVEYOR_BUILD_NUMBER || process.env.TRAVIS_BUILD_NUMBER || process.env.CIRCLE_BUILD_NUM;
if (buildNumber) {
    version = `${version}+${buildNumber}`;
}

console.log(`Using version: ${version}`);

if (process.env.APPVEYOR_BUILD_NUMBER) {
    console.log('AppVeyor detected, running `appveyor UpdateBuild`');
    require('child_process').exec(`appveyor UpdateBuild -Version "${version}"`);
}


gulp.task('updatePackageJson', function () {
    return gulp.src([ './package.json' ])
        .pipe(jsonModify({
            key: 'version',
            value: version
        }))
        .pipe(gulp.dest('./'));
});

gulp.task('updateAppPackageJson', function () {
    return gulp.src([ './app/package.json' ])
        .pipe(jsonModify({
            key: 'version',
            value: version
        }))
        .pipe(gulp.dest('./app'));
});

gulp.task('package', ['updatePackageJson','updateAppPackageJson'], function(done){
    packager(
        {
            dir: "app",
            arch: "all",
            asar: true,
            "build-version": version,
            download: {
                cache: "temp/downloads"
            },
            icon: "build/icons/icon", // extension will autocomplete based on platform 
            out: "dist",
            overwrite: true,
            platform: (process.platform == 'win32'
                ? ["win32", "linux"]
                : ["linux", "mas", "darwin"]),
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

gulp.task('default', ['updatePackageJson','updateAppPackageJson','package']);