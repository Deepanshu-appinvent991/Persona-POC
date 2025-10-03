import { Request, Response } from 'express';
import { Entity } from '../models/Entity';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { setCache, getCache, deleteCache } from '../config/redis';

// Step-by-step entity creation process
// Step 1: Basic Information (Name, Identification Number)
export const createEntityStep1 = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, identificationNumber } = req.body;
  
  // Check if identification number already exists
  const existingEntity = await Entity.findOne({ identificationNumber });
  if (existingEntity) {
    return res.status(400).json({
      success: false,
      message: 'Entity with this identification number already exists'
    });
  }

  // Create temporary entity data in cache
  const tempEntityId = `temp_entity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const entityData = {
    name,
    identificationNumber,
    createdBy: req.user?._id,
    status: 'PENDING',
    step: 1,
    completedSteps: ['basic_info']
  };

  // Store in Redis for 30 minutes
  await setCache(`temp_entity:${tempEntityId}`, entityData, 1800);

  res.status(201).json({
    success: true,
    message: 'Step 1 completed - Basic information saved',
    data: {
      tempEntityId,
      step: 1,
      nextStep: 2,
      entityData: {
        name,
        identificationNumber
      }
    }
  });
});

// Step 2: Contact Information (Email, Phone)
export const createEntityStep2 = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { tempEntityId } = req.params;
  const { email, phone, dateOfBirth } = req.body;

  // Get temporary entity data from cache
  const tempEntityData = await getCache(`temp_entity:${tempEntityId}`);
  if (!tempEntityData) {
    return res.status(404).json({
      success: false,
      message: 'Temporary entity data not found or expired. Please start over.'
    });
  }

  // Update entity data
  const updatedEntityData = {
    ...tempEntityData,
    email,
    phone,
    dateOfBirth,
    step: 2,
    completedSteps: [...tempEntityData.completedSteps, 'contact_info']
  };

  // Update cache
  await setCache(`temp_entity:${tempEntityId}`, updatedEntityData, 1800);

  res.status(200).json({
    success: true,
    message: 'Step 2 completed - Contact information saved',
    data: {
      tempEntityId,
      step: 2,
      nextStep: 3,
      entityData: {
        name: updatedEntityData.name,
        identificationNumber: updatedEntityData.identificationNumber,
        email,
        phone,
        dateOfBirth
      }
    }
  });
});

// Step 3: Address Information
export const createEntityStep3 = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { tempEntityId } = req.params;
  const { address } = req.body;

  // Get temporary entity data from cache
  const tempEntityData = await getCache(`temp_entity:${tempEntityId}`);
  if (!tempEntityData) {
    return res.status(404).json({
      success: false,
      message: 'Temporary entity data not found or expired. Please start over.'
    });
  }

  // Update entity data
  const updatedEntityData = {
    ...tempEntityData,
    address,
    step: 3,
    completedSteps: [...tempEntityData.completedSteps, 'address_info']
  };

  // Update cache
  await setCache(`temp_entity:${tempEntityId}`, updatedEntityData, 1800);

  res.status(200).json({
    success: true,
    message: 'Step 3 completed - Address information saved',
    data: {
      tempEntityId,
      step: 3,
      nextStep: 4,
      entityData: {
        ...updatedEntityData,
        step: undefined,
        completedSteps: undefined
      }
    }
  });
});

// Step 4: Profile Photo Upload
export const createEntityStep4 = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { tempEntityId } = req.params;
  const { profilePhotoData } = req.body; // This would come from file upload

  // Get temporary entity data from cache
  const tempEntityData = await getCache(`temp_entity:${tempEntityId}`);
  if (!tempEntityData) {
    return res.status(404).json({
      success: false,
      message: 'Temporary entity data not found or expired. Please start over.'
    });
  }

  // Update entity data
  const updatedEntityData = {
    ...tempEntityData,
    profilePhoto: profilePhotoData,
    step: 4,
    completedSteps: [...tempEntityData.completedSteps, 'profile_photo']
  };

  // Update cache
  await setCache(`temp_entity:${tempEntityId}`, updatedEntityData, 1800);

  res.status(200).json({
    success: true,
    message: 'Step 4 completed - Profile photo uploaded',
    data: {
      tempEntityId,
      step: 4,
      nextStep: 5,
      profilePhoto: profilePhotoData
    }
  });
});

// Step 5: Document Upload (PDF, Images, CSV)
export const createEntityStep5 = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { tempEntityId } = req.params;
  const { documents } = req.body; // Array of document data

  // Get temporary entity data from cache
  const tempEntityData = await getCache(`temp_entity:${tempEntityId}`);
  if (!tempEntityData) {
    return res.status(404).json({
      success: false,
      message: 'Temporary entity data not found or expired. Please start over.'
    });
  }

  // Update entity data
  const updatedEntityData = {
    ...tempEntityData,
    documents: documents || [],
    step: 5,
    completedSteps: [...tempEntityData.completedSteps, 'documents']
  };

  // Update cache
  await setCache(`temp_entity:${tempEntityId}`, updatedEntityData, 1800);

  res.status(200).json({
    success: true,
    message: 'Step 5 completed - Documents uploaded',
    data: {
      tempEntityId,
      step: 5,
      nextStep: 6,
      documents: documents || []
    }
  });
});

// Step 6: Final Review and Submission
export const createEntityStep6 = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { tempEntityId } = req.params;
  const { additionalData } = req.body;

  // Get temporary entity data from cache
  const tempEntityData = await getCache(`temp_entity:${tempEntityId}`);
  if (!tempEntityData) {
    return res.status(404).json({
      success: false,
      message: 'Temporary entity data not found or expired. Please start over.'
    });
  }

  // Prepare final entity data (remove temporary fields)
  const {
    step,
    completedSteps,
    ...finalEntityData
  } = tempEntityData;

  // Add any additional data
  if (additionalData) {
    finalEntityData.additionalData = additionalData;
  }

  // Create the actual entity in MongoDB
  const entity = await Entity.create(finalEntityData);

  // Store in both MongoDB and Redis
  await setCache(`entity:${entity._id}`, entity.toJSON(), 1800);

  // Clean up temporary data
  await deleteCache(`temp_entity:${tempEntityId}`);

  res.status(201).json({
    success: true,
    message: 'Entity created successfully! All steps completed.',
    data: {
      entity,
      submittedSteps: [
        'basic_info',
        'contact_info', 
        'address_info',
        'profile_photo',
        'documents',
        'final_submission'
      ]
    }
  });
});

// Get step-by-step progress
export const getEntityProgress = asyncHandler(async (req: Request, res: Response) => {
  const { tempEntityId } = req.params;

  const tempEntityData = await getCache(`temp_entity:${tempEntityId}`);
  if (!tempEntityData) {
    return res.status(404).json({
      success: false,
      message: 'Progress data not found or expired'
    });
  }

  const totalSteps = 6;
  const currentStep = tempEntityData.step || 1;
  const completedSteps = tempEntityData.completedSteps || [];

  res.status(200).json({
    success: true,
    data: {
      tempEntityId,
      currentStep,
      totalSteps,
      completedSteps,
      progress: Math.round((completedSteps.length / totalSteps) * 100),
      nextStep: currentStep < totalSteps ? currentStep + 1 : null,
      entityData: {
        ...tempEntityData,
        step: undefined,
        completedSteps: undefined
      }
    }
  });
});

// Cancel step-by-step process
export const cancelEntityCreation = asyncHandler(async (req: Request, res: Response) => {
  const { tempEntityId } = req.params;

  await deleteCache(`temp_entity:${tempEntityId}`);

  res.status(200).json({
    success: true,
    message: 'Entity creation process cancelled and temporary data removed'
  });
});
