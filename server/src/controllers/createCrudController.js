import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logActivity } from '../services/activityLog.js';
import { uniqueSlug } from '../utils/slugify.js';

/**
 * Builds the standard list/get/create/update/delete/reorder handlers shared by
 * projects, updates, skills, services and journey entries. Resource specific
 * behaviour is injected through `options` rather than duplicated per model.
 */
export function createCrudController({
  Model,
  resource,
  labelField = 'title',
  slugFrom,
  defaultSort = { order: 1, createdAt: -1 },
  searchFields = [],
  beforeSave,
}) {
  const label = (doc) => doc?.[labelField] || '';

  const list = asyncHandler(async (req, res) => {
    const { search, status, category, published, page, limit } = req.validatedQuery || {};
    const filter = {};

    if (search && searchFields.length) {
      const pattern = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = searchFields.map((field) => ({ [field]: pattern }));
    }
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (published !== undefined) filter.published = published === 'true';

    const skip = ((page || 1) - 1) * (limit || 20);

    const [items, total] = await Promise.all([
      Model.find(filter).sort(defaultSort).skip(skip).limit(limit || 20).lean(),
      Model.countDocuments(filter),
    ]);

    res.json({ items, total, page: page || 1, limit: limit || 20 });
  });

  const getOne = asyncHandler(async (req, res) => {
    const item = await Model.findById(req.params.id).lean();
    if (!item) throw ApiError.notFound(`${resource} not found`);
    res.json({ item });
  });

  const create = asyncHandler(async (req, res) => {
    const payload = { ...req.body };

    if (slugFrom) {
      payload.slug = await uniqueSlug(Model, payload.slug || payload[slugFrom]);
    }
    if (payload.order === undefined) {
      const last = await Model.findOne().sort({ order: -1 }).select('order').lean();
      payload.order = (last?.order ?? -1) + 1;
    }
    if (beforeSave) await beforeSave(payload, null, req);

    const item = await Model.create(payload);

    await logActivity(req.admin, `${resource}_created`, {
      targetType: resource,
      targetId: item._id,
      targetLabel: label(item),
    });

    res.status(201).json({ item });
  });

  const update = asyncHandler(async (req, res) => {
    const item = await Model.findById(req.params.id);
    if (!item) throw ApiError.notFound(`${resource} not found`);

    const payload = { ...req.body };
    if (slugFrom && payload.slug !== undefined) {
      payload.slug = await uniqueSlug(Model, payload.slug || payload[slugFrom] || item[slugFrom], item._id);
    }
    if (beforeSave) await beforeSave(payload, item, req);

    Object.assign(item, payload);
    await item.save();

    await logActivity(req.admin, `${resource}_updated`, {
      targetType: resource,
      targetId: item._id,
      targetLabel: label(item),
    });

    res.json({ item });
  });

  const remove = asyncHandler(async (req, res) => {
    const item = await Model.findByIdAndDelete(req.params.id);
    if (!item) throw ApiError.notFound(`${resource} not found`);

    await logActivity(req.admin, `${resource}_deleted`, {
      targetType: resource,
      targetId: item._id,
      targetLabel: label(item),
    });

    res.json({ message: `${resource} deleted` });
  });

  const reorder = asyncHandler(async (req, res) => {
    const operations = req.body.items.map(({ id, order }) => ({
      updateOne: { filter: { _id: id }, update: { $set: { order } } },
    }));
    await Model.bulkWrite(operations);

    await logActivity(req.admin, `${resource}_reordered`, {
      targetType: resource,
      detail: `${operations.length} items reordered`,
    });

    res.json({ message: 'Order updated' });
  });

  return { list, getOne, create, update, remove, reorder };
}
