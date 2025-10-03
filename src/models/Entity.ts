import mongoose, { Document, Schema } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

export interface IAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface IDocument {
  type: 'PDF' | 'IMAGE' | 'CSV' | 'OTHER';
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  uploadedAt: Date;
}

export interface IEntity extends Document {
  // Basic Information
  name: string;
  identificationNumber: string;
  inquiryId: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date;
  
  // Address Information
  address: IAddress;
  
  // Real-time photo
  profilePhoto?: IDocument;
  
  // Documents
  documents: IDocument[];
  
  // Approval System
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
  approvedBy?: mongoose.Types.ObjectId;
  rejectedBy?: mongoose.Types.ObjectId;
  approvalDate?: Date;
  rejectionDate?: Date;
  approvalNotes?: string;
  rejectionReason?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy?: mongoose.Types.ObjectId;
  
  // Additional fields for flexibility
  additionalData?: Record<string, any>;
}

const AddressSchema = new Schema<IAddress>({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  postalCode: { type: String, required: true }
});

const DocumentSchema = new Schema<IDocument>({
  type: { 
    type: String, 
    enum: ['PDF', 'IMAGE', 'CSV', 'OTHER'], 
    required: true 
  },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  path: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
});

const EntitySchema = new Schema<IEntity>({
  // Basic Information
  name: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 100
  },
  identificationNumber: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    maxlength: 50
  },
  inquiryId: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    maxlength: 50
  },
  email: { 
    type: String, 
    required: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: { 
    type: String,
    trim: true,
    maxlength: 20
  },
  dateOfBirth: { type: Date },
  
  // Address Information
  address: { 
    type: AddressSchema, 
    required: true 
  },
  
  // Real-time photo
  profilePhoto: DocumentSchema,
  
  // Documents
  documents: [DocumentSchema],
  
  // Approval System
  status: { 
    type: String, 
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW'], 
    default: 'PENDING' 
  },
  approvedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  rejectedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  approvalDate: { type: Date },
  rejectionDate: { type: Date },
  approvalNotes: { 
    type: String,
    maxlength: 500
  },
  rejectionReason: { 
    type: String,
    maxlength: 500
  },
  
  // Metadata
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  
  // Additional fields for flexibility
  additionalData: { 
    type: Schema.Types.Mixed 
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
EntitySchema.index({ identificationNumber: 1 });
EntitySchema.index({ inquiryId: 1 });
EntitySchema.index({ email: 1 });
EntitySchema.index({ status: 1 });
EntitySchema.index({ createdAt: -1 });
EntitySchema.index({ 'address.city': 1, 'address.state': 1 });

// Virtual for full address
EntitySchema.virtual('fullAddress').get(function(this: IEntity) {
  return `${this.address.street}, ${this.address.city}, ${this.address.state}, ${this.address.country} ${this.address.postalCode}`;
});

// Pre-save middleware
EntitySchema.pre('save', function(this: IEntity, next) {
  // Auto-generate inquiry ID if not provided
  if (!this.inquiryId) {
    this.inquiryId = `INQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

// Add pagination plugin
EntitySchema.plugin(mongooseAggregatePaginate);

export const Entity = mongoose.model<IEntity>('Entity', EntitySchema);
