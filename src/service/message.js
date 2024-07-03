export const Role = {
  user: "user",
  admin: "admin",
  owner: "owner",
};

export const StatusOrder = {
  pending: "pending",
  success: "success",
  cancel: "cancel",
};

// EMessage = Error Message
export const EMessage = {
  Server: "Error Server Internal",
  BadRequest: "Bad Request",
  NotFound: "Not Found",
  Already: "Already",
  Unauthorized: "Unauthorized",
  InvalideUnauthorized: "Invalid unauthorized",
  PleaseInput: "Please Input: ",
  InsertError: "Error Insert",
  UpdateError: "Error Update",
  DeleteError: "Error Delete",
  NotMatch: "Not match password",
  UploadImageError: "Upload Image Error",
};

// SMessage = Success Message
export const SMessage = {
  GetOne: "Get One Success",
  GetAll: "Get All Success",
  Login: "Login Success",
  Register: "Register Success",
  Insert: "Insert Success",
  Update: "Update Success",
  Delete: "Delete Success",
};
