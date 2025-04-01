import mongoose, {Schema , Document} from "mongoose";
import bcrypt from 'bcryptjs';


export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'admin' | 'manager' | 'member';
  isEmailVerified: boolean;
  lastLogin?: Date;
  workspaces: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
    {
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      avatar: { type: String },
      role: { 
        type: String, 
        enum: ['admin', 'manager', 'member'], 
        default: 'member' 
      },
      isEmailVerified: { type: Boolean, default: false },
      lastLogin: { type: Date },
      workspaces: [{ type: Schema.Types.ObjectId, ref: 'Workspace' }]
    },
    { timestamps: true }
  );
  
  UserSchema.pre<IUser>('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  });
  
  UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  };
  
  export default mongoose.model<IUser>('User', UserSchema);