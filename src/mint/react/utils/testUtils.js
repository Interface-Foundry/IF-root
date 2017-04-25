// react/utils/testUtils.js

export const fakeStore = (state) => ({
  default: () => {},
  subscribe: () => {},
  dispatch: () => {},
  getState: () => {
    return { ...state };
  }
});
