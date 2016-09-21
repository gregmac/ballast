const icongen = require( 'icon-gen' );
const fs = require('fs-extra');

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
  })
  .catch( (err) => {
    console.error( 'err', err );
  });

function move(oldname, newname) 
{
    console.log("Moving", oldname, "to", newname);
    return fs.renameSync(oldname, newname);
}