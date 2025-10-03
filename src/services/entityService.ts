import { Entity } from '../models/Entity';
import { User } from '../models/User';
import { setCache, getCache, deleteCache } from '../config/redis';
import { sendApprovalEmail, sendRejectionEmail } from './emailService';

class EntityService {
  // Create new entity
  async createEntity(entityData: any, userId: string) {
    const newEntityData = {
      ...entityData,
      createdBy: userId,
      status: 'PENDING'
    };

    const entity = await Entity.create(newEntityData);

    // Cache the entity for 30 minutes
    await setCache(`entity:${entity._id}`, entity.toJSON(), 1800);
    
    // Cache in pending entities list
    const pendingEntities = await getCache('entities:pending') || [];
    pendingEntities.unshift(entity.toJSON());
    await setCache('entities:pending', pendingEntities, 1800);

    return entity;
  }

  // Get all entities with pagination and filtering
  async getEntities(query: any) {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = query;

    // Build filter object
    const filter: any = {};
    
    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { identificationNumber: { $regex: search, $options: 'i' } },
        { inquiryId: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortDirection = sortOrder === 'desc' ? -1 : 1;

    // Get total count
    const totalDocs = await Entity.countDocuments(filter);

    // Get entities
    const entities = await Entity.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName email')  
      .populate('rejectedBy', 'firstName lastName email')
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(parseInt(limit));

    // Calculate pagination info
    const totalPages = Math.ceil(totalDocs / parseInt(limit));
    const currentPage = parseInt(page);
    const hasPrevPage = currentPage > 1;
    const hasNextPage = currentPage < totalPages;

    return {
      entities,
      pagination: {
        totalDocs,
        limit: parseInt(limit),
        totalPages,
        page: currentPage,
        hasPrevPage,
        hasNextPage,
        prevPage: hasPrevPage ? currentPage - 1 : null,
        nextPage: hasNextPage ? currentPage + 1 : null
      }
    };
  }

  // Get single entity
  async getEntity(id: string) {
    // Try to get from cache first
    let entity = await getCache(`entity:${id}`);

    if (!entity) {
      // If not in cache, get from database
      entity = await Entity.findById(id)
        .populate('createdBy', 'firstName lastName email')
        .populate('approvedBy', 'firstName lastName email')
        .populate('rejectedBy', 'firstName lastName email');

      if (!entity) {
        throw new Error('Entity not found');
      }

      // Cache for 30 minutes
      await setCache(`entity:${id}`, entity.toJSON(), 1800);
    }

    return entity;
  }

  // Update entity
  async updateEntity(id: string, updateData: any) {
    const entity = await Entity.findById(id);

    if (!entity) {
      throw new Error('Entity not found');
    }

    // Only allow updates if status is PENDING or UNDER_REVIEW
    if (!['PENDING', 'UNDER_REVIEW'].includes(entity.status)) {
      throw new Error('Cannot update entity that has been approved or rejected');
    }

    const updatedEntity = await Entity.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    // Update cache
    await setCache(`entity:${id}`, updatedEntity!.toJSON(), 1800);

    return updatedEntity;
  }

  // Delete entity
  async deleteEntity(id: string) {
    const entity = await Entity.findById(id);

    if (!entity) {
      throw new Error('Entity not found');
    }

    await Entity.findByIdAndDelete(id);

    // Remove from cache
    await deleteCache(`entity:${id}`);
  }

  // Approve entity
  async approveEntity(id: string, userId: string, approvalNotes?: string) {
    const entity = await Entity.findById(id);

    if (!entity) {
      throw new Error('Entity not found');
    }

    if (entity.status === 'APPROVED') {
      throw new Error('Entity is already approved');
    }

    if (entity.status === 'REJECTED') {
      throw new Error('Cannot approve a rejected entity');
    }

    // Update entity status
    entity.status = 'APPROVED';
    entity.approvedBy = userId as any;
    entity.approvalDate = new Date();
    entity.approvalNotes = approvalNotes;

    await entity.save();

    // Update cache
    await setCache(`entity:${id}`, entity.toJSON(), 1800);

    // Send approval email
    try {
      await sendApprovalEmail(entity.email, entity.name, approvalNotes);
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
    }

    return entity;
  }

  // Reject entity
  async rejectEntity(id: string, userId: string, rejectionReason: string) {
    if (!rejectionReason) {
      throw new Error('Rejection reason is required');
    }

    const entity = await Entity.findById(id);

    if (!entity) {
      throw new Error('Entity not found');
    }

    if (entity.status === 'REJECTED') {
      throw new Error('Entity is already rejected');
    }

    if (entity.status === 'APPROVED') {
      throw new Error('Cannot reject an approved entity');
    }

    // Update entity status
    entity.status = 'REJECTED';
    entity.rejectedBy = userId as any;
    entity.rejectionDate = new Date();
    entity.rejectionReason = rejectionReason;

    await entity.save();

    // Update cache
    await setCache(`entity:${id}`, entity.toJSON(), 1800);

    // Send rejection email
    try {
      await sendRejectionEmail(entity.email, entity.name, rejectionReason);
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError);
    }

    return entity;
  }

  // Get entity statistics
  async getEntityStats() {
    const stats = await Entity.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalEntities = await Entity.countDocuments();
    
    const formattedStats = {
      total: totalEntities,
      pending: 0,
      approved: 0,
      rejected: 0,
      underReview: 0
    };

    stats.forEach(stat => {
      switch (stat._id) {
        case 'PENDING':
          formattedStats.pending = stat.count;
          break;
        case 'APPROVED':
          formattedStats.approved = stat.count;
          break;
        case 'REJECTED':
          formattedStats.rejected = stat.count;
          break;
        case 'UNDER_REVIEW':
          formattedStats.underReview = stat.count;
          break;
      }
    });

    return formattedStats;
  }
}

export const entityService = new EntityService();
