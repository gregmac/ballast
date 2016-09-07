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
        "url":"https://confluence.atlassian.com/jira062/files/588581642/588418888/1/1388980500549/jira-examplewallboard.png",
        "size":"fullscreen"
    }
]
```

#### License [Apache 2.0](LICENSE.md)
