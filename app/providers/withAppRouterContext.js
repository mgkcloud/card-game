// app/providers/withAppRouterContext.js

import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';

const withAppRouterContext = (Story) => {
  return (
    <AppRouterContext.Provider
      value={{
        push: () => Promise.resolve(),
        replace: () => Promise.resolve(),
        refresh: () => Promise.resolve(),
        prefetch: () => Promise.resolve(),
        back: () => Promise.resolve(),
        forward: () => Promise.resolve(),
        // Add any other router methods you need
      }}
    >
      <Story />
    </AppRouterContext.Provider>
  );
};

export default withAppRouterContext;
