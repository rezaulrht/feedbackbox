import mongoose, {Document, InferSchemaType, Schema} from "mongoose";

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // IMPORTANT: doesn't return passwordHash unless you explicitly ask
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    verifyCode: {
      type: String,
      default: null,
    },
    verifyCodeExpiry: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

export type UserDoc = InferSchemaType<typeof UserSchema>;

const UserModel = (mongoose.models.User as mongoose.Model<UserDoc>) || mongoose.model<UserDoc>("User", UserSchema);

export default UserModel;