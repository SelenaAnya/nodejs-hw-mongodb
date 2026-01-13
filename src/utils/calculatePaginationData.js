export const calculatePaginationData = (count, perPage, page) => {
    const totalPages = Math.ceil(count / perPage);
    const hasPreviousPage = page > 1;
    const hasNextPage = page < totalPages;

    return {
        totalItems: count,
        totalPages,
        perPage,
        page,
        hasPreviousPage,
        hasNextPage,
    };
};
