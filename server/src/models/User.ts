import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
  username :{type:String,required:true,unique:true,index:true},
  passwordHash:{type:String,required:true},
})
export const UserModel = mongoose.model('User', userSchema);

