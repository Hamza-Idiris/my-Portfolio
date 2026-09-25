import { Project } from '../models/Project.js';
import { Post, estimateReadingTime } from '../models/Post.js';
import { Skill } from '../models/Skill.js';
import { Service } from '../models/Service.js';
import { JourneyEvent } from '../models/JourneyEvent.js';
import { Certification } from '../models/Certification.js';
import { createCrudController } from './createCrudController.js';

export const projectsController = createCrudController({
  Model: Project,
  resource: 'project',
  labelField: 'title',
  slugFrom: 'title',
  defaultSort: { order: 1, createdAt: -1 },
  searchFields: ['title', 'shortDescription', 'technologies'],
});

export const postsController = createCrudController({
  Model: Post,
  resource: 'update',
  labelField: 'title',
  slugFrom: 'title',
  defaultSort: { createdAt: -1 },
  searchFields: ['title', 'excerpt', 'tags'],
  beforeSave(payload, existing) {
    if (payload.content !== undefined) {
      payload.readingTime = estimateReadingTime(payload.content);
    }
    // Stamp the publish date the first time an update goes live.
    if (payload.published && !payload.publishedAt && !existing?.publishedAt) {
      payload.publishedAt = new Date();
    }
  },
});

export const skillsController = createCrudController({
  Model: Skill,
  resource: 'skill',
  labelField: 'name',
  defaultSort: { order: 1, name: 1 },
  searchFields: ['name', 'category'],
});

export const servicesController = createCrudController({
  Model: Service,
  resource: 'service',
  labelField: 'title',
  defaultSort: { order: 1 },
  searchFields: ['title', 'description'],
});

export const journeyController = createCrudController({
  Model: JourneyEvent,
  resource: 'journey entry',
  labelField: 'title',
  defaultSort: { order: 1 },
  searchFields: ['title', 'description'],
});

export const certificationsController = createCrudController({
  Model: Certification,
  resource: 'certification',
  labelField: 'title',
  defaultSort: { order: 1, createdAt: -1 },
  searchFields: ['title', 'issuer', 'description', 'skills'],
});
