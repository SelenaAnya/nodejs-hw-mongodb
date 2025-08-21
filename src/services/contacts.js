import { ContactsCollection } from '../db/models/contact.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';

export const getAllContacts = async ({
  page = 1,
  perPage = 10,
  sortBy,
  sortOrder = 'asc',
  filter = {},
  userId
}) => {
  const limit = perPage;
  const skip = (page - 1) * perPage;

  // Build filter object
  const contactsFilter = { userId };
  if (filter.type) {
    contactsFilter.contactType = filter.type;
  }
  if (filter.isFavourite !== undefined) {
    contactsFilter.isFavourite = filter.isFavourite;
  }

  const contactsQuery = ContactsCollection.find(contactsFilter);

  // Apply sorting if sortBy is provided
  if (sortBy) {
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    contactsQuery.sort(sortOptions);
  }

  const contactsCount = await ContactsCollection.find(contactsFilter).countDocuments();

  const contacts = await contactsQuery.skip(skip).limit(limit).exec();

  const paginationData = calculatePaginationData(contactsCount, perPage, page);

  return {
    data: contacts,
    ...paginationData,
  };
};

export const getContactById = async (contactId, userId) => {
  const contact = await ContactsCollection.findOne({
    _id: contactId,
    userId
  });
  return contact;
};

export const createContact = async (payload) => {
  const contact = await ContactsCollection.create(payload);
  return contact;
};

export const updateContact = async (contactId, payload, userId, options = {}) => {
  const rawResult = await ContactsCollection.findOneAndUpdate(
    { _id: contactId, userId },
    payload,
    {
      new: true,
      includeResultMetadata: true,
      ...options,
    },
  );

  if (!rawResult || !rawResult.value) return null;

  return rawResult.value;
};

export const deleteContact = async (contactId, userId) => {
  const contact = await ContactsCollection.findOneAndDelete({
    _id: contactId,
    userId,
  });

  return contact;
};
