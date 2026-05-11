export const MAX_PROFILE_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

export const validateProfileImage = (file: File) => {
  if (!file.type.startsWith("image/")) {
    return "Please select a valid image file";
  }

  if (file.size > MAX_PROFILE_IMAGE_SIZE_BYTES) {
    return "Profile picture must be 2MB or less";
  }

  return null;
};

export const uploadImageToCloudinary = async (file: File) => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary is not configured. Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME or NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  const payload = await response.json();

  if (!response.ok || !payload.secure_url) {
    throw new Error(payload?.error?.message ?? "Failed to upload profile picture");
  }

  return String(payload.secure_url);
};
