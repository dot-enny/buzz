# Buzz

## Description
Live Chat Application built with react and firebase.   
Add friends and start chatting with them instantly on Buzz.

## Status
Work in progress

## Tech Stack, Tools and Packages.
- Vite.
- React.
- React Router.
- Firebase.
- React Toastify.
- Zustand.
- Tailwind.

## Author

- Github - [dot-enny](https://github.com/dot-enny)
- Twitter - [@pixelade_](https://twitter.com/pixelade_)
- Linkedin - [Olaniyan Eniola](https://www.linkedin.com/in/eniola-olaniyan-63a578263)

## Run Locally
To run this project locally,run 'npm install' to install project dependencies after cloning and run 'npm run dev' to start server.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list
