import { createRequire } from "module";
const require = createRequire(import.meta.url);

const path = require("path");
const eleventyImage = require("@11ty/eleventy-img");

export function pluginImages(eleventyConfig) {
    function relativeToInputPath(inputPath, relativeFilePath) {
        let split = inputPath.split("/");
        split.pop();

        return path.resolve(split.join(path.sep), relativeFilePath);
    }

    // Eleventy Image shortcode
    // https://www.11ty.dev/docs/plugins/image/
    eleventyConfig.addAsyncShortcode("image", async function imageShortcode(src, className, alt, widths, sizes) {
        // Full list of formats here: https://www.11ty.dev/docs/plugins/image/#output-formats
        // Warning: Avif can be resource-intensive so take care!
        let formats = ["avif", "webp", "auto"];
        let file = relativeToInputPath(this.page.inputPath, src);
        // console.log("file: ", file);


        // Match the input directory structure
        const imageDirectory = src.split("/").slice(0, -1).join("/");
        let outputDir = relativeToInputPath(this.page.outputPath, imageDirectory);

        // console.log("outputDir: ", outputDir);


        let metadata = await eleventyImage(file, {
            widths: widths || ["auto"],
            formats,
            outputDir,
            urlPath: `./${imageDirectory}/`
            // outputDir: path.join(eleventyConfig.dir.output, "img"), // Advanced usage note: `eleventyConfig.dir` works here because we’re using addPlugin.
        });

        // TODO loading=eager and fetchpriority=high
        let imageAttributes = {
            class: className,
            alt,
            sizes,
            loading: "lazy",
            decoding: "async",
        };
        return eleventyImage.generateHTML(metadata, imageAttributes);
    });
};