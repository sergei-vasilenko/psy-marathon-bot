const userSchema = {
  first_name: {
    type: "string",
    required: true,
  },
  last_name: {
    type: "string",
    required: true,
  },
  username: {
    type: "string",
    required: true,
  },
  chat_id: {
    type: "number",
    required: true,
  },
  scene: {
    type: "number",
    default: 0,
  },
  step: {
    type: "number",
    default: 0,
  },
  is_active: {
    type: "boolean",
    default: true,
  },
  is_completed: {
    type: "boolean",
    default: false,
  },
  course_beginnings: {
    type: "number",
    default: 0,
  },
  date_of_joining: {
    type: "string",
  },
  last_activity_time: {
    type: "number",
  },
  scene_message: {
    type: [{ scene: "number", text: "string" }],
    default: [],
  },
  scene_duration: {
    type: [{ scene: "number", since: "number", until: "number" }],
    default: [],
  },
};

export default userSchema;
