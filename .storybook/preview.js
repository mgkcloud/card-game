/** @type { import('@storybook/react').Preview } */
import '../app/globals.css'; // replace with the name of your tailwind css file
import withAppRouterContext from '../app/providers/withAppRouterContext';

export const decorators = [withAppRouterContext];

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};


const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
