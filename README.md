# \_component-framework

The component Framework is a development environment that helps build web pages for IANS e-learning.

This repo also contains the IANS style guide (`app/_style-guide/index.html`) as well as the source files for the core IANS stylesheet (`app/_style-guide/styles/scss/ians-core-3.scss`). It also provides a starter kit for developing web pages (`app/_web-page-template/index.html`).

## Getting Started

- Copy the project development files to your project folder (all files and folders except `.git` and `node_modules`)
- In your terminal type, `npm install`
- copy and rename the `app/_web-page-template` folder.
- - The `app/_web-page-template/index.html` file contains examples of different components. These can be added/deleted as required.
- In your terminal type, `gulp`
- Once you have finished developing, type `gulp build` into your terminal. A zip file of your development will be created in the page folder in the `dist` folder.

## Using git: Branching

To work on a new feature or hotfix, follow these steps.

- from the master branch `git pull`
- `git checkout -b new-branch-name`
  - Branch names should follow the format _ddmmyy-authorinitials-feature-name_ e.g. `160320-pg-readme-update`
- Push work regularly with `git add -A && git commit -m "Commit message here" && git push`
- When the feature is finished, push as above then merge to master and delete with the following:
  - `git checkout master`
  - `git pull`
  - `git merge new-branch-name`
  - `git push`
  - `git branch -d new-branch-name`
  - `git push --delete origin new-branch-name`
- Or just use a GUI ;-)

## NPM for components

### How to use 3rd party NPM components

NPM [https://www.npmjs.com/](https://www.npmjs.com/) is a package manager that allows us to install packages (such as jQuery, Greensock, dragula etc.) via the terminal. NPM allows us to maintain these packages more easily.

This example shows how to install a package that allows us to drag and drop DOM elements.

- Type the following into the terminal
- `npm install sortablejs --save`
- In your webpage folder: `scripts/modules/main.js` add `import Sortable from "sortablejs";`

Now you can start to use sortablejs. First add the DOM elements according to sortablejs docs:

    <div id="dragExample">
        <div class="drag-example-item">Item 1</div>
        <div class="drag-example-item">Item 2</div>
        <div class="drag-example-item-tinted">Item 3</div>
        <div class="drag-example-item-tinted">Item 4</div>
    </div>

Then add javascript to your `scripts/modules/main.js` file e.g.

    new Sortable(dragExample, {
      animation: 150
    });

    var el = document.getElementById('dragExample');
    var sortable = Sortable.create(el);

If you get a notice from github that your dependency (e.g. sortablejs) has a security flaw or other bug, in your project, type, 'npm update sortablejs' and then 'gulp build' and the dependency will be updated wherever it is used in your project.

### How to use Internal components

Internal components are just like 3rd party NPM packages and work in the same way but are private to IANS and are developed in-house.

IANS packages are stored in the https://github.com/EUROCONTROL-IANS/_component-packages repository. They are accessed via the Github Package Registry.

To install a package:

- As the packages are in a private repository, we need to add a `.npmrc` file to the route of our project. You only need to follow these instructions once! It should contain the following:


    registry=https://npm.pkg.github.com/eurocontrol-ians
    //npm.pkg.github.com/:_authToken=YOUR_PERSONAL_ACCESS_TOKEN
    always-auth=true

Replace `YOUR_PERSONAL_ACCESS_TOKEN` with your personal token. To get your token, click on your github profile picture and select `settings` from the menu. Select `Developer Settings` (currently on the left hand list). Select `Personal access tokens` and then `Generate new token`. Give it a title of "GHR Personal access token" and check the `repo` (all), `write:packages`, `read:packages` and `delete:packages`. Click `Generate token` and copy the code to your .npmrc file. This file can be used in all your projects where you need to use IANS packages. This code should be kept secure!

- Now you can install packages from the terminal with `npm install @EUROCONTROL-IANS/<package-name> --save` e.g. `npm install @EUROCONTROL-IANS/ians-scroll-to-top --save`. This installs the package to `node_modules` and writes the dependency to your `package.json` file.
- You can now reference the package in your development files e.g.
- In `app/scripts/src/main.src.js` add `import { ScrollToTop } from "@EUROCONTROL-IANS/ians-scroll-to-top";`
- In `app/styles/scss/main.scss` add `@import "@EUROCONTROL-IANS/ians-scroll-to-top/scrollToTop.scss";`
- The component should now appear on your page.

### How to update dependency vulnerabilities if you get a github alert

If you get **github security alerts**, follow this process. **Create a new branch before updating in case dependency updates brake the framework!!**

Part of the solution is being able to run `npm audit` to get dependency information. This will trigger an error due to the use of github package repository. Therefore, the first step is to:

- Remove all text from the `.npmrc` file in root and copy it somewhere as we will need to put it back later.
- Also remove any `@EUROCONTROL-IANS/` packages from `dependencies` in `package.json`. We will also need to put these back later.
- Now run `npm audit`. This should show current vulnerabilities. This gives you an idea of the current state.
- Now run `npm audit fix if offered`.
- Now run `npm audit` again.
- This may not fix all vulnerabilities so you will have to review outstanding issues and judge severity. Remember that only `dependency` packages are sent to public facing websites! It is very hard to fix nested dependencies and we usually have to wait for the package owner to make the fix so we can update.
- Replace the lines we removed at the start.
- Finally, test the framework to make sure it still works with the updated dependencies.

### How to publish Internal components

First build and test your component in the normal web development environment.

Then move all required assets into a package folder and give the component a name with the "ians-" prefix. The assets could be .js, .css, .scss, images and even .html pages to give example usage if adding HTML dom elements are required to use the component.

The folder should also include a README.md file that explains what the package does, how to use it and any other details that developers will require.

The folder should also include a package.json file. This must include the following fields (note the "ians-" prefix in the name:

    "name": "@EUROCONTROL-IANS/ians-component-name",
      "version": "1.0.0",
      "description": "Description here.",
      "main": "index.js",
      "repository": {
        "type": "git",
        "url": "git+https://github.com/EUROCONTROL-IANS/_component-packages.git",
        "directory": "ians-component-folder-name/"
      },
      "publishConfig": {
        "registry": "https://npm.pkg.github.com/"
      },

Next the publish workflow must be edited to publish this component. The workflow is here: https://github.com/EUROCONTROL-IANS/_component-packages/blob/master/.github/workflows/main.yml
There is a commented out template for the required code at the bottom of this file.

Now add the component folder to the root of the https://github.com/EUROCONTROL-IANS/_component-packages/ repository and update the README.md file in the root of the repository to list the new component. Once you push these additions up to github, the Action workflow should run and you !should! see the new package published and available to use in your projects.

### Reason to use

Current practice: we add a dependency to a page and register it in the spreadsheet. If used regularly, it's uploaded to the customs URL.

Problems:

- Dependencies were reviewed every six months or so to check if outdated or a security issue.
- Alternatively, dependencies had to be updated as the result of periodic security scans
- Developers don't have direct control over upload to customs.
- additional work for uploader (Nadine)

The process is very manual and can leave security issues in place for some time.

Proposed new practice: use NPM (Node Package Manager).

A package is just one or more files of CSS or JS code stored in a git repository. Once installed in our project, that package becomes a dependency. NPM is the industry standard for managing dependencies.

NPM works as a bridge between the developer and the github repo that contains the dependency code package. NMP allows developers to quickly and easily install and update dependencies based on Semantic Versioning. NPM automatically adds these dependencies to the package.json file in our project repository. Github automatically scans this list and will alert us as soon as there is an issue with a dependency. We can create packages for our own code which can then be managed in the same way.

The benefits are:

- Instant security notices
- Automated version handling
- Increased code reusability and flexibility
- Update a dependency in a project repo and all links to that dependency in the course are updated on rebuild.

### Comparison Example

An example may help illustrate the difference. We want to add the drag and drop 'Dragula' library to a few pages in a project. This requires a CSS and a JS file.

Current approach: Download files and add to project. If frequently used, request they are uploaded to Customs and use that URL. Add links to each file in HTML. Remember to add dependency to spreadsheet. On a manual review, a security flaw is found in the library. Once a new version of Dragula is uploaded to 'Customs', each link in a project that uses it has to be found and manually updated.

NPM: Developer types `npm install dragula`. Then `@import "dragula"` in our SASS styles file and `import dragula from 'dragula.js'` in our JS file. Github alerts us about a security flaw. Developer types `npm update dragula` and all references are updated.
