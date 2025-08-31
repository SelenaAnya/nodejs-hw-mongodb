export const createContactController = async (req, res) => {
    console.log('User in createContactController:', req.user);
    console.log('Request body:', req.body);
    console.log('Uploaded file:', req.file);

    if (!req.user || !req.user._id) {
        throw createHttpError(401, 'User not authenticated');
    }

    // Add the URL of the photo if the file was uploaded
    const contactData = {
        ...req.body,
        photo: req.file ? req.file.path : undefined
    };

    const contact = await createContact(contactData, req.user._id);

    res.status(201).json({
        status: 201,
        message: 'Successfully created a contact!',
        data: contact,
    });
};

export const patchContactController = async (req, res, next) => {
    console.log('User in patchContactController:', req.user);
    console.log('Uploaded file:', req.file);

    const { contactId } = req.params;

    if (!req.user || !req.user._id) {
        throw createHttpError(401, 'User not authenticated');
    }

    // Add the photo URL to the update data if the file was uploaded
    const updateData = {
        ...req.body,
        ...(req.file && { photo: req.file.path })
    };

    const result = await updateContact(contactId, updateData, req.user._id);

    if (!result) {
        next(createHttpError(404, 'Contact not found'));
        return;
    }

    res.json({
        status: 200,
        message: 'Successfully patched a contact!',
        data: result.contact,
    });
};
