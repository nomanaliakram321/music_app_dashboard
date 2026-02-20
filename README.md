# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Description

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses
  [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast
  Refresh

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [Import Order Guidelines](#import-order-guidelines)

## Installation

Clone this repository. You will need node and npm installed globally on your machine.

**Installation:**

```
git clone <repository_url>

cd <project_directory>

yarn install
```

## Usage

**To Start Server:**

```
yarn dev
```

**View it in your browser:**

```
Open your browser and go to

http://localhost:3000/app
```

**To build the project for production:**

```
yarn build
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Clone the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Add your changes (`git add [add-respective-files-path]`).
5. Commit your changes (`git commit -m 'Add respective commit'`).
6. Push to the branch (`git push origin feature-branch`).
7. Open a pull request.

## Import Order Guidelines

When importing files in the project, follow this structure:

1. Built-in modules (e.g., react, react-dom) should be imported at the top.
2. Built-in modules (e.g., fs, path in Node.js) should be imported at the top.
3. Add a blank line after the built-in and external imports.
4. Internal files should be imported after the blank line and should always use the # alias.

```
 Built-in modules import React from 'react'; import ReactDOM from 'react-dom/client';

 External npm packages import lodash from 'lodash';

 Internal files import Button from '#/components/Button'; import utils from '#/utils/helpers';
```
