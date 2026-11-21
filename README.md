# DeepShart website

The DeepShart product site is published at [deepshart.lol](https://deepshart.lol) using GitHub Pages from `main:/docs`.

Edit the English and Simplified Chinese copy in `content.mjs`, then regenerate the static pages.

```sh
node build.mjs
python3 -m http.server --directory docs
```

The device images were rendered from the DeepShart desktop and mobile layouts using an example conversation. The website uses Lucide icons and the Gitee mark from Simple Icons. The software license and Lucide license are included in the published files.
