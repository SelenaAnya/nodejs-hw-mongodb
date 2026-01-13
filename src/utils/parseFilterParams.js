const parseIsFavourite = (isFavourite) => {
    if (typeof isFavourite !== 'string') return;

    const normalizedValue = isFavourite.toLowerCase();
    if (normalizedValue === 'true') return true;
    if (normalizedValue === 'false') return false;

    return;
};

const parseContactType = (type) => {
    const validTypes = ['work', 'home', 'personal'];

    if (typeof type === 'string' && validTypes.includes(type.toLowerCase())) {
        return type.toLowerCase();
    }

    return;
};

export const parseFilterParams = (query) => {
    const { type, isFavourite } = query;

    const parsedType = parseContactType(type);
    const parsedIsFavourite = parseIsFavourite(isFavourite);

    // Create a filter object by removing the undefined value
    const filters = {};

    if (parsedType !== undefined) {
        filters.contactType = parsedType;
    }

    if (parsedIsFavourite !== undefined) {
        filters.isFavourite = parsedIsFavourite;
    }

    return filters;
};
