import { minify } from "terser";
import { DateTime } from "luxon";
import { EleventyHtmlBasePlugin } from "@11ty/eleventy"
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import { pluginDrafts } from "./_back-end/config/eleventy.config.drafts.js";
import { pluginReading } from "./_back-end/config/eleventy.config.reading.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const EleventyVitePlugin = require("@11ty/eleventy-plugin-vite");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginNavigation = require("@11ty/eleventy-navigation");
const pluginBundle = require("@11ty/eleventy-plugin-bundle");
import { transform } from 'lightningcss';


export default async function (eleventyConfig) {

    eleventyConfig.addPassthroughCopy("website-source/**/*.(css|js|json)");
    eleventyConfig.addPassthroughCopy("website-source/**/*.{svg,webp,avif,png,jpeg,jpg,ico,webmanifest,txt,ttf}");


    // eleventyConfig.addPassthroughCopy({
    //     "node_modules/@11ty/eleventy-fetch/**": "js/eleventy-fetch/"
    // });
    // Watch content images for the image pipeline.
    eleventyConfig.addWatchTarget("website-source/**/*.{svg,webp,avif,png,jpeg,jpg,css,js}");

    // Official plugins
    eleventyConfig.addPlugin(pluginRss);
    eleventyConfig.addPlugin(pluginSyntaxHighlight, {
        preAttributes: { tabindex: 0 }
    });
    eleventyConfig.addPlugin(pluginNavigation);
    eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
    eleventyConfig.addPlugin(eleventyImageTransformPlugin);
    eleventyConfig.addPlugin(pluginBundle);
    // Plugins
    eleventyConfig.addPlugin(pluginDrafts);
    eleventyConfig.addPlugin(pluginReading);

    // Add bundles
    // eleventyConfig.addBundle("css");
    // eleventyConfig.addBundle("js");

    // Custom collections
    // eleventyConfig.addCollection("pagesSorted", function (collectionApi) {
    //     const pages = collectionApi.getFilteredByTag("page");
    //     const sorted = pages.sort(function (a, b) {
    //         return a.data.order - b.data.order;
    //     });
    //     return sorted;
    // });

    // Add filters
    eleventyConfig.addFilter("cssmin", async function (input) {
        let { code } = await transform({
            filename: 'test.css',
            code: new TextEncoder().encode(input.toString()),
            minify: true,
            sourceMap: false
        });
        return new TextDecoder().decode(code);
    });

    eleventyConfig.addNunjucksAsyncFilter("jsmin", async (code, callback) => {
        const minified = await minify(code);
        return callback(null, minified.code);
    });

    // Return all the tags used in a collection
    eleventyConfig.addFilter("getAllTags", collection => {
        let tagSet = new Set();
        for (let item of collection) {
            (item.data.tags || []).forEach(tag => tagSet.add(tag));
        }
        return Array.from(tagSet);
    });

    eleventyConfig.addFilter("filterTagList", function filterTagList(tags) {
        return (tags || []).filter(tag => ["all", "nav", "post", "posts"].indexOf(tag) === -1);
    });

    // Filters
    eleventyConfig.addFilter("readableDate", (dateObj, format, zone) => {
        // Formatting tokens for Luxon: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
        return DateTime.fromJSDate(dateObj, { zone: zone || "utc" }).toFormat(format || "dd LLLL yyyy");
    });

    eleventyConfig.addFilter('htmlDateString', (dateObj) => {
        // dateObj input: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
        return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat('yyyy-LL-dd');
    });

    // Only use vite in dev - esbuild for build
    if (process.env.DEV_ENVIRONMENT === "dev") {
        eleventyConfig.addPlugin(EleventyVitePlugin, {
            tempFolderName: "website-build", // Default name of the temp folder
            // viteOptions: { base: "/" },
        });
    }

    // Remove templates from build
    // if (process.env.DEV_ENVIRONMENT != "dev") {
    //     eleventyConfig.ignores.add('website-source/_web-page-template/**/*');
    //     eleventyConfig.ignores.add('website-source/_example/**/*');
    //     eleventyConfig.ignores.add('website-source/_example-hero/**/*');
    // }

    eleventyConfig.setServerOptions({
        showAllHosts: true,
    })

    return {
        templateFormats: [
            "md",
            "njk",
            "html",
            "liquid",
        ],

        // Pre-process *.md files with: (default: `liquid`)
        markdownTemplateEngine: "njk",

        // Pre-process *.html files with: (default: `liquid`)
        htmlTemplateEngine: "njk",

        dir: {
            input: "website-source",          // default: "."
            output: "website-build",
            layouts: "../_back-end/_layouts",
            includes: "../_back-end/_components",  // default: "_includes"
            data: "../_back-end/_data"          // default: "_data"
        },

        // If your site deploys to a subdirectory, change `pathPrefix`.
        // Read more: https://www.11ty.dev/docs/config/#deploy-to-a-subdirectory-with-a-path-prefix

        // When paired with the HTML <base> plugin https://www.11ty.dev/docs/plugins/html-base/
        // it will transform any absolute URLs in your HTML to include this
        // folder name and does **not** affect where things go in the output folder.
        pathPrefix: "/",
    }
}