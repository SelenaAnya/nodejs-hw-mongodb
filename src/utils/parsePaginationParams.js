export const parsePaginationParams = (query) => {
    const { page, perPage } = query;

    const parsedPage = parseInt(page);
    const parsedPerPage = parseInt(perPage);

    return {
        page: Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1,
        perPage: Number.isInteger(parsedPerPage) && parsedPerPage > 0 ? parsedPerPage : 10,
    };
};
