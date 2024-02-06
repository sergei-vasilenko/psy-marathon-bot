import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  chat_id: {
    type: Number,
    required: true,
  },
  scene: {
    type: Number,
    default: 0,
  },
  step: {
    type: Number,
    default: 0,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
  is_completed: {
    type: Boolean,
    default: false,
  },
  course_beginnings: {
    type: Number,
    default: 0,
  },
  date_of_joining: {
    type: String,
  },
  last_activity_time: {
    type: Number,
  },
  scene_message: {
    type: [{ scene: Number, text: String }],
    default: [],
  },
  scene_duration: {
    type: [{ scene: Number, since: Number, until: Number }],
    default: [],
  },
});

const User = mongoose.model("User", userSchema);

export default User;
