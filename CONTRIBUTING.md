<!-- omit in toc -->
# Contributing to Ottoman
First off, thanks for taking the time to contribute! ❤️

All types of contributions are encouraged and valued. See the [Table of Contents](#table-of-contents) for different ways to help and details about how this project handles them. Please make sure to read the relevant section before making your contribution. It will make it a lot easier for us maintainers and smooth out the experience for all involved. The community looks forward to your contributions. 🎉

> And if you like the project, but just don't have time to contribute, that's fine. There are other easy ways to support the project and show your appreciation, which we would also be very happy about:
> - Star the project
> - Tweet about it
> - Refer to this project in your project's readme
> - Mention the project at local meetups and tell your friends/colleagues

<!-- omit in toc -->
## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [I Want To Contribute](#i-want-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Contributing Code](#contributing-code)
  - [Improving The Documentation](#improving-the-documentation)
- [I Have a Question](#i-have-a-question)


## Code of Conduct
This project and everyone who participates in it are governed by the
[Ottoman Code of Conduct](https://github.com/couchbaselabs/node-ottoman/blob/master/CODE_OF_CONDUCT.md).
By participating, you are expected to uphold this code.


## I Want To Contribute

> ### Legal Notice <!-- omit in toc -->
> When contributing to this project, you must agree that you have authored 100% of the content, that you have the necessary rights to the content, and that the content you contribute may be provided under the project license.

### Reporting Bugs

<!-- omit in toc -->
#### Before Submitting a Bug Report

A good bug report shouldn't leave others needing to chase you up for more information. Therefore, we ask you to investigate carefully, collect information, and describe the issue in detail in your report. Please complete the following steps in advance to help us fix any potential bug as fast as possible.

- Make sure that you are using the latest version.
- Determine if your bug is really a bug and not an error on your side e.g. using incompatible environment components/versions (Make sure that you have read the [documentation](https://ottomanjs.com/). If you are looking for support, you might want to check [this section](#i-have-a-question)).
- To see if other users have experienced (and potentially already solved) the same issue you are having, check if there is not already a bug report existing for your bug or error in the [bug tracker](https://github.com/couchbaselabs/node-ottoman/issues?q=label%3Abug).
- Also make sure to search the internet (including Stack Overflow) to see if users outside of the GitHub community have discussed the issue.
- Collect information about the bug:
  - Stack trace (Traceback)
  - OS, Platform, and Version (Windows, Linux, macOS, x86, ARM)
  - Version of the interpreter, compiler, SDK, runtime environment, package manager, depending on what seems relevant.
  - Possibly your input and the output
  - Can you reliably reproduce the issue? And can you also reproduce it with older versions?

<!-- omit in toc -->
#### How Do I Submit a Good Bug Report?
We use GitHub issues to track bugs and errors. If you run into an issue with the project:

- Open an [Issue](https://github.com/couchbaselabs/node-ottoman/issues/new). (Since we can't be sure at this point whether it is a bug or not, we ask you not to talk about a bug yet and not to label the issue.)
- Explain the behavior you would expect and the actual behavior.
- Please provide as much context as possible and describe the *reproduction steps* that someone else can follow to recreate the issue on their own. This usually includes your code. For good bug reports, you should isolate the problem and create a reduced test case.
- Provide the information you collected in the previous section.

Once it's filed:

- The project team will label the issue accordingly.
- A team member will try to reproduce the issue with your provided steps. If there are no reproduction steps or no obvious way to reproduce the issue, the team will ask you for those steps and mark the issue as `needs-repro`. Bugs with the `needs-repro` tag will not be addressed until they are reproduced.
- If the team is able to reproduce the issue, it will be marked `needs-fix`, as well as possibly other tags (such as `critical`), and the issue will be left to be [implemented by someone](#your-first-code-contribution).

### Suggesting Enhancements

<!-- omit in toc -->
#### Before Submitting an Enhancement
- Make sure that you are using the latest version.
- Read the [documentation](https://ottomanjs.com/) carefully and find out if the functionality is already covered, maybe by an individual configuration.
- Perform a [search](https://github.com/couchbaselabs/node-ottoman/issues) to see if the enhancement has already been suggested. If it has, add a comment to the existing issue instead of opening a new one.
- Find out whether your idea fits with the scope and aims of the project. It's up to you to make a strong case to convince the project's developers of the merits of this feature. Keep in mind that we want features that will be useful to the majority of our users and not just a small subset. If you're just targeting a minority of users, consider writing an add-on/plugin library.

<!-- omit in toc -->
#### How Do I Submit a Good Enhancement Suggestion?

Enhancement suggestions are tracked as [GitHub issues](https://github.com/couchbaselabs/node-ottoman/issues).

- Use a **clear and descriptive title** for the issue to identify the suggestion.
- Provide a **step-by-step description of the suggested enhancement** in as many details as possible.
- **Describe the current behavior** and **explain which behavior you expected to see instead** and why. At this point, you can also tell which alternatives do not work for you.
- **Explain why this enhancement would be useful** to most Ottoman users. You may also want to point out the other projects that solved it better and which could serve as inspiration.

### Contributing Code

#### Developing
You'll need to [Install Couchbase Server Using Docker](https://docs.couchbase.com/server/current/install/getting-started-docker.html).

To develop locally:
1. [Fork](https://docs.github.com/en/get-started/quickstart/fork-a-repo) this repository to your own GitHub account and then [clone](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository) it to your local device
2. Create a new branch:
  ```
  git checkout -b MY_BRANCH_NAME
  ```
3. Install yarn (if you don't already have it installed):
  ```
  npm install -g yarn
  ```
4. Install dependencies:
  ```
  yarn install
  ```
5. Start developing
  ```
  yarn dev
  ```

#### Building
You can build the project with:
```
yarn build
```

#### Testing
You must [Install Couchbase Server Using Docker](https://docs.couchbase.com/server/current/install/getting-started-docker.html) and [add the travel-sample bucket](https://docs.couchbase.com/server/current/manage/manage-settings/install-sample-buckets.html) for tests to pass.

Use `yarn test` to run tests _with_ scopes and collections. _Note: This may fail a few times at first as indexes are building. We are working to fix this._

Use `yarn test:legacy` to run tests _without_ scopes and collections.

Use `yarn test:coverage` to run tests with coverage data.

### Improving The Documentation
The Ottoman docs site uses Vuepress. You can edit and contribute to the documentation by manipulating files in the `/vuepress` directory.

Build and serve the docs site by running `yarn docs:build` and `yarn docs:start` to verify your changes. 

Please add documentation suggestions as a pull request from your own fork of Ottoman, as outlines in the [Contributing Code](#contributing-code) section. 

## I Have a Question
> If you want to ask a question, we assume that you have read the available [Documentation](https://ottomanjs.com/).

Before you ask a question, it is best to search for existing [Issues](https://github.com/couchbaselabs/node-ottoman/issues) that might help you. In case you have found a suitable issue and still need clarification, you can write your question in this issue. It is also advisable to search the internet for answers first.

If you then still feel the need to ask a question and need clarification, we recommend the following:

- Open an [Issue](https://github.com/couchbaselabs/node-ottoman/issues/new).
- Provide as much context as you can about what you're running into.
- Provide project and platform versions (nodejs, npm, etc), depending on what seems relevant.
- Tag it as a question

We will then take care of the issue as soon as possible.

<!-- omit in toc -->
## Attribution
This guide is based on the **contributing-gen**. [Make your own](https://github.com/bttger/contributing-gen)!
