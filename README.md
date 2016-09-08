# ballast

**A digital signage web render client.**

This is a simple web browser that has a single job: make sure a web page is always being displayed. It's designed for running "wallboards" or information radiators, typically on a wall-mounted TV, and without user intervention once configured. 

 * Built using [Electron](http://electron.atom.io), which means it runs the [Chromium](https://www.chromium.org/) browser engine (same as [Google Chrome](https://www.google.com/chrome/))
 * Handles network failures, failure responses from servers, crashes and other problems.  
 * Supports multiple windows and multiple displays.

## Configuration

Minimal configuration example:

```
{
    "displays": [
        {
            "url":"http://example.com/path/to/statuspage",
            "size":"fullscreen"
        }
    ]
}
```

The configuration file format is [HJSON](http://hjson.org/), which means you can skip some quotes and use comments. 

Complex example:

```
{
    displays: [
        {
            url: http://example.com/path/to/statuspage
            screen: 1
            size: "fullscreen" // not actually necessary, as size defaults to "fullscreen" 
        },
        {
            url: http://example.com/top-half
            screen: 2
            size:[1920,540]
            position:[0,0]
        },
        {
            url: http://example.com/bottom-half
            screen: 2
            size:[1920,540]
            position:[0,540]
        },
    ]
    
    failureRetryTime: 5000, // time in ms to retry after page failed to load (eg: network failure)
    
    nonSuccessRetryTime: 15000, // time in ms to retry when getting a non-200 response code from server  
}
```

#### License [Apache 2.0](LICENSE.md)
