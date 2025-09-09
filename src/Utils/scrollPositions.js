const scrollPositions = {};

export const saveScrollPosition = (key) => {
    scrollPositions[key] = window.scrollY;
    console.log('Saved:', key, scrollPositions[key]);
};

export const getScrollPosition = (key) => {
    return scrollPositions[key];
};
