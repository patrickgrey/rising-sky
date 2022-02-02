const { DateTime } = require("luxon");
const fs = require("fs");
const path = require("path");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginNavigation = require("@11ty/eleventy-navigation");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const Image = require("@11ty/eleventy-img");

async function imageShortcode(src, alt, cls, isBG, sizes, widths, formats) {
  const sizesString = sizes || `(max-width: 2400px) 100vw, 2400px`;
  const isBackground = isBG || false;

  let metadata = await Image(src, {
    widths: widths || [320, 960, 1200, 2400],
    formats: formats || ["avif", "webp", "jpeg"],
    outputDir: "./_site/img/"
  });

  let imageAttributes = {
    class: cls || "",
    alt,
    sizes: sizesString,
    loading: "lazy",
    decoding: "async",
  };

  // console.log(metadata);
  if (!isBackground) {
    return Image.generateHTML(metadata, imageAttributes);
  }
  else {
    // console.log(metadata.jpeg[0].filename);
    const imagePrefix = "../img/";
    let CSS = `
    .${cls} {
      background-image: url(${imagePrefix}${metadata.jpeg[3].filename});
    }

    @media (max-width: 320px) {
      .${cls} {
        background-image: url(${imagePrefix}${metadata.jpeg[0].filename});
        background-image: url(${imagePrefix}${metadata.webp[0].filename});
        background-image: url(${imagePrefix}${metadata.avif[0].filename});
      }
    }
    
    @media (min-width: 321px) and (max-width: 640px) {
      .${cls} {
        background-image: url(${imagePrefix}${metadata.jpeg[1].filename});
        background-image: url(${imagePrefix}${metadata.webp[1].filename});
        background-image: url(${imagePrefix}${metadata.avif[1].filename});
      }
    }
    
    @media (min-width: 641px) and (max-width: 1200px) {
      .${cls} {
        background-image: url(${imagePrefix}${metadata.jpeg[2].filename});
        background-image: url(${imagePrefix}${metadata.webp[2].filename});
        background-image: url(${imagePrefix}${metadata.avif[2].filename});
      }
    }
    
    @media (min-width: 1201px) {
      .${cls} {
        background-image: url(${imagePrefix}${metadata.jpeg[3].filename});
        background-image: url(${imagePrefix}${metadata.webp[3].filename});
        background-image: url(${imagePrefix}${metadata.avif[3].filename});
      }
    }`;

    const styleBlock = `<style>${CSS}</style>`;
    // Set the img to display none
    imageAttributes.class = "hide";
    // const allCode = styleBlock + Image.generateHTML(metadata, imageAttributes)
    return styleBlock;
  }
}

module.exports = function (eleventyConfig) {
  // Copy the `img` and `css` folders to the output
  eleventyConfig.addPassthroughCopy("img");
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("fonts");
  eleventyConfig.addPassthroughCopy("scripts");

  // Short codes
  eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);

  // Add plugins
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(pluginSyntaxHighlight);
  eleventyConfig.addPlugin(pluginNavigation);

  // Alias `layout: post` to `layout: layouts/post.njk`
  eleventyConfig.addLayoutAlias("writing", "layouts/writing.njk");

  eleventyConfig.addFilter("readableDate", dateObj => {
    return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat("dd LLL yyyy");
  });

  // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  eleventyConfig.addFilter('htmlDateString', (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat('yyyy-LL-dd');
  });

  // Get the first `n` elements of a collection.
  eleventyConfig.addFilter("head", (array, n) => {
    if (!Array.isArray(array) || array.length === 0) {
      return [];
    }
    if (n < 0) {
      return array.slice(n);
    }

    return array.slice(0, n);
  });

  // Return the smallest number argument
  eleventyConfig.addFilter("min", (...numbers) => {
    return Math.min.apply(null, numbers);
  });

  function filterTagList(tags) {
    return (tags || []).filter(tag => ["all", "nav", "post", "posts", "writing"].indexOf(tag) === -1);
  }

  eleventyConfig.addFilter("filterTagList", filterTagList)

  // Create an array of all tags
  eleventyConfig.addCollection("tagList", function (collection) {
    let tagSet = new Set();
    collection.getAll().forEach(item => {
      (item.data.tags || []).forEach(tag => tagSet.add(tag));
    });

    return filterTagList([...tagSet]);
  });

  // Customize Markdown library and settings:
  let markdownLibrary = markdownIt({
    html: true,
    breaks: true,
    linkify: true
  }).use(markdownItAnchor, {
    permalink: markdownItAnchor.permalink.ariaHidden({
      placement: "after",
      class: "direct-link",
      symbol: "#",
      level: [1, 2, 3, 4],
    }),
    slugify: eleventyConfig.getFilter("slug")
  });
  eleventyConfig.setLibrary("md", markdownLibrary);

  // Override Browsersync defaults (used only with --serve)
  eleventyConfig.setBrowserSyncConfig({
    callbacks: {
      ready: function (err, browserSync) {
        const content_404 = fs.readFileSync('_site/404.html');

        browserSync.addMiddleware("*", (req, res) => {
          // Provides the 404 content without redirect.
          res.writeHead(404, { "Content-Type": "text/html; charset=UTF-8" });
          res.write(content_404);
          res.end();
        });
      },
    },
    ui: false,
    ghostMode: false
  });

  return {
    // Control which files Eleventy will process
    // e.g.: *.md, *.njk, *.html, *.liquid
    templateFormats: [
      "md",
      "njk",
      "html",
      "liquid"
    ],

    // Pre-process *.md files with: (default: `liquid`)
    markdownTemplateEngine: "njk",

    // Pre-process *.html files with: (default: `liquid`)
    htmlTemplateEngine: "njk",

    // -----------------------------------------------------------------
    // If your site deploys to a subdirectory, change `pathPrefix`.
    // Don’t worry about leading and trailing slashes, we normalize these.

    // If you don’t have a subdirectory, use "" or "/" (they do the same thing)
    // This is only used for link URLs (it does not affect your file structure)
    // Best paired with the `url` filter: https://www.11ty.dev/docs/filters/url/

    // You can also pass this in on the command line using `--pathprefix`

    // Optional (default is shown)
    pathPrefix: "/",
    // -----------------------------------------------------------------

    // These are all optional (defaults are shown):
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site"
    }
  };
};
