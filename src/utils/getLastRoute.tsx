export const getLastRoute = (path:string) => {
    const segments = path?.split('/');
    return segments[segments?.length - 1];
};