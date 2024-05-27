# \_dev-template

This template is a work environment to create e-learning pages.

## Prerequisites

This template requires node v18 or greater.

## Installation

Clone the repo and in your terminal run `npm i`.

## Run & Build

In your terminal run `npm run dev`. This should provide a link to open in your browser.
Run `npm run build` to create a production ready version of the files.

## Structure

### package.json

Development scripts are contained in the `package.json` file.

### config files in root folder

Config files are all commented and exist in the root directory.

- `eleventy.config.js` 11ty is the static site generator used to process HTML pages. 

### website-source

The `website-source` folder contains all of the source files for the project content.

#### website-source: folder: \_web-page-template

Copy this folder as a starter template for basic pages.

#### website-source: folder: \_shared

Contains files shared across all pages like the brand css and custom css and js you want shared in all pages

#### course-source: folder: \_direct-access

Dynamically builds the direct access pages based on the data on the `metadata.json` file. See the features section below for more details.

#### course-source: file: root: index.html

This page contains dynamically created contents. It is also an example of how to stretch a short page so that the footer sticks to the bottom.

### course-publish

The `course-publish` folder contains the generated files that are viewed in the browser.
