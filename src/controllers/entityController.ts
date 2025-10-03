import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Entity, IEntity } from '../models/Entity';
import { User } from '../models/User';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { setCache, getCache, deleteCache } from '../config/redis';
import { sendApprovalEmail, sendRejectionEmail } from '../services/emailService';

// @desc    Create new entity
// @route   POST /api/entities
// @access  Private
export const createEntity = asyncHandler(async (req: AuthRequest, res: Response) => {
  const entityData = {
    ...req.body,
    createdBy: req.user?._id,
    status: 'PENDING'
  };

  const entity = await Entity.create(entityData);

  // Cache the entity for 30 minutes
  await setCache(`entity:${entity._id}`, entity.toJSON(), 1800);
  
  // Cache in pending entities list
  const pendingEntities = await getCache('entities:pending') || [];
  pendingEntities.unshift(entity.toJSON());
  await setCache('entities:pending', pendingEntities, 1800);

  res.status(201).json({
    success: true,
    message: 'Entity created successfully',
    data: { entity }
  });
});

// @desc    Get all entities with pagination and filtering
// @route   GET /api/entities
// @access  Private
export const getEntities = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    status,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build aggregation pipeline
  const pipeline: any[] = [];

  // Match stage for filtering
  const matchStage: any = {};
  
  if (status) {
    matchStage.status = status;
  }

  if (search) {
    matchStage.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { identificationNumber: { $regex: search, $options: 'i' } },
      { inquiryId: { $regex: search, $options: 'i' } }
    ];
  }

  pipeline.push({ $match: matchStage });

  // Lookup created by user
  pipeline.push({
    $lookup: {
      from: 'users',
      localField: 'createdBy',
      foreignField: '_id',
      as: 'createdByUser',
      pipeline: [
        { $project: { firstName: 1, lastName: 1, email: 1 } }
      ]
    }
  });

  // Lookup approved by user
  pipeline.push({
    $lookup: {
      from: 'users',
      localField: 'approvedBy',
      foreignField: '_id',
      as: 'approvedByUser',
      pipeline: [
        { $project: { firstName: 1, lastName: 1, email: 1 } }
      ]
    }
  });

  // Lookup rejected by user
  pipeline.push({
    $lookup: {
      from: 'users',
      localField: 'rejectedBy',
      foreignField: '_id',
      as: 'rejectedByUser',
      pipeline: [
        { $project: { firstName: 1, lastName: 1, email: 1 } }
      ]
    }
  });

  // Add computed fields
  pipeline.push({
    $addFields: {
      createdBy: { $arrayElemAt: ['$createdByUser', 0] },
      approvedBy: { $arrayElemAt: ['$approvedByUser', 0] },
      rejectedBy: { $arrayElemAt: ['$rejectedByUser', 0] }
    }
  });

  // Remove temporary fields
  pipeline.push({
    $project: {
      createdByUser: 0,
      approvedByUser: 0,
      rejectedByUser: 0
    }
  });

  // Sort stage
  const sortDirection = sortOrder === 'desc' ? -1 : 1;
  pipeline.push({ $sort: { [sortBy as string]: sortDirection } });

  // Execute aggregation with pagination
  const options = {
    page: parseInt(page as string),
    limit: parseInt(limit as string)
  };

  const result = await (Entity as any).aggregatePaginate(
    Entity.aggregate(pipeline),
    options
  );

  res.status(200).json({
    success: true,
    data: {
      entities: result.docs,
      pagination: {
        totalDocs: result.totalDocs,
        limit: result.limit,
        totalPages: result.totalPages,
        page: result.page,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevPage: result.prevPage,
        nextPage: result.nextPage
      }
    }
  });
});

// @desc    Get single entity
// @route   GET /api/entities/:id
// @access  Private
export const getEntity = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Try to get from cache first
  let entity = await getCache(`entity:${id}`);

  if (!entity) {
    // If not in cache, get from database
    entity = await Entity.findById(id)
      .populate('createdBy', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName email')
      .populate('rejectedBy', 'firstName lastName email');

    if (!entity) {
      return res.status(404).json({
        success: false,
        message: 'Entity not found'
      });
    }

    // Cache for 30 minutes
    await setCache(`entity:${id}`, entity.toJSON(), 1800);
  }

  res.status(200).json({
    success: true,
    data: { entity }
  });
});

// @desc    Update entity
// @route   PUT /api/entities/:id
// @access  Private
export const updateEntity = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  let entity = await Entity.findById(id);

  if (!entity) {
    return res.status(404).json({
      success: false,
      message: 'Entity not found'
    });
  }

  // Only allow updates if status is PENDING or UNDER_REVIEW
  if (!['PENDING', 'UNDER_REVIEW'].includes(entity.status)) {
    return res.status(400).json({
      success: false,
      message: 'Cannot update entity that has been approved or rejected'
    });
  }

  entity = await Entity.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true
  });

  // Update cache
  await setCache(`entity:${id}`, entity!.toJSON(), 1800);

  res.status(200).json({
    success: true,
    message: 'Entity updated successfully',
    data: { entity }
  });
});

// @desc    Delete entity
// @route   DELETE /api/entities/:id
// @access  Private (Admin only)
export const deleteEntity = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const entity = await Entity.findById(id);

  if (!entity) {
    return res.status(404).json({
      success: false,
      message: 'Entity not found'
    });
  }

  await Entity.findByIdAndDelete(id);

  // Remove from cache
  await deleteCache(`entity:${id}`);

  res.status(200).json({
    success: true,
    message: 'Entity deleted successfully'
  });
});

// @desc    Approve entity
// @route   PUT /api/entities/:id/approve
// @access  Private (Approver/Admin only)
export const approveEntity = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { approvalNotes } = req.body;

  const entity = await Entity.findById(id);

  if (!entity) {
    return res.status(404).json({
      success: false,
      message: 'Entity not found'
    });
  }

  if (entity.status === 'APPROVED') {
    return res.status(400).json({
      success: false,
      message: 'Entity is already approved'
    });
  }

  if (entity.status === 'REJECTED') {
    return res.status(400).json({
      success: false,
      message: 'Cannot approve a rejected entity'
    });
  }

  // Update entity status
  entity.status = 'APPROVED';
  entity.approvedBy = req.user?._id as mongoose.Types.ObjectId;
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
    // Don't fail the request if email fails
  }

  res.status(200).json({
    success: true,
    message: 'Entity approved successfully',
    data: { entity }
  });
});

// @desc    Reject entity
// @route   PUT /api/entities/:id/reject
// @access  Private (Approver/Admin only)
export const rejectEntity = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { rejectionReason } = req.body;

  if (!rejectionReason) {
    return res.status(400).json({
      success: false,
      message: 'Rejection reason is required'
    });
  }

  const entity = await Entity.findById(id);

  if (!entity) {
    return res.status(404).json({
      success: false,
      message: 'Entity not found'
    });
  }

  if (entity.status === 'REJECTED') {
    return res.status(400).json({
      success: false,
      message: 'Entity is already rejected'
    });
  }

  if (entity.status === 'APPROVED') {
    return res.status(400).json({
      success: false,
      message: 'Cannot reject an approved entity'
    });
  }

  // Update entity status
  entity.status = 'REJECTED';
  entity.rejectedBy = req.user?._id as mongoose.Types.ObjectId;
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
    // Don't fail the request if email fails
  }

  res.status(200).json({
    success: true,
    message: 'Entity rejected successfully',
    data: { entity }
  });
});

// @desc    Get entities statistics
// @route   GET /api/entities/stats
// @access  Private
export const getEntityStats = asyncHandler(async (req: Request, res: Response) => {
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

  res.status(200).json({
    success: true,
    data: { stats: formattedStats }
  });
});
