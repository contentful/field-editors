# MultipleEntryReferenceEditor field app

This app demonstrates how you would use the simplest field we have `MultipleEntryReferenceEditor` with your own custom logic.

## Setting up the app

In order to you see your app running in the Contentful web app, you need to create an `AppDefinition` to expose the app to Contentful. You can run the following command to create an `AppDefinition`:

`npx @contentful/create-contentful-app create-definition`

During the setup, you will be able to choose where the app will be displayed. This app is designed to replace an "Entry Reference List" Entry field, so we recommend selecting `Entry field` and then `Entry reference, list` during setup.

If you play to extend your app to be displayed for other field types or in other locations, feel free to select those too. You can always change this in your organization settings within Contentful.

## Commands

This packages uses [create-contentful-app](https://github.com/contentful/create-contentful-app).

### `yarn start`

Starts the development server and builds the app in development mode.

The app will automatically reload if you make changes to the code.

### `yarn build`

Builds the app for production to the build folder.
It correctly bundles React and all dependencies in production mode and optimizes the build for the best performance.
