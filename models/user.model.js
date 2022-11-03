import mongoose from 'mongoose'

export const Role = {
  ADMIN: 'ADMIN',
  USER: 'USER'
}

export const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  avatar: String,
  role: {
    type: String,
    enum: Object.values(Role)
  }
})

export const User = mongoose.model("User", UserSchema);
