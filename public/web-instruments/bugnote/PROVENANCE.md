# bugnote Web application

Source: https://github.com/voboku/bugnote

Snapshot: `dbee1eca7e494bca4c349364be7692647f65b15a`

Verified against the published https://bugnote.netlify.app/ deployment on
2026-09-09. `index.html`, `script.js`, and `style.css` are copied without
modification from that commit. This is the browser application, separate from
the bugnote 3 native plug-in downloads.

The runtime uses Canvas and Web Audio directly, with no CDN or additional asset
dependencies. Audio files are selected and decoded locally in the browser.
The repository README's p5.js/CDN reference does not describe this snapshot.

SHA-256:

```text
fcdd7f3563345420b62946badcda7b49f563e0c413c734fa6273757ff6e62dbb  index.html
c6934f2842decdb9b0bbe529d2400c004df0d16b581e019495553b884207daa3  script.js
30fc9f579f6e63d735f9e3d8d039b865afa304d673be84ac35c2c2d1f73b701f  style.css
```

The existing `bugnote-legacy-icon.png` represents the app in the collection;
the original web snapshot contains no icon asset. No native plug-in files or
licensing terms were changed by this integration.
