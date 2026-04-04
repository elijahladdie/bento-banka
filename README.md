# BANKA Frontend

## Environment Variables

Create a `.env` file in the `frontend` folder and set:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
```

Notes:
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` must be an unsigned upload preset configured in your Cloudinary console.
- The signup flow uses these values in browser-side upload requests to Cloudinary.

## Profile Picture Upload (Signup)

Signup now supports optional profile picture upload:

- User selects an image file in the signup form.
- File validation runs client-side (image type only, max size 2MB).
- File is uploaded to Cloudinary before `/auth/register` is called.
- The returned `secure_url` is sent as `profilePicture` in the registration payload.
- If no image is selected, `profilePicture` is sent as `null`.

If Cloudinary is not configured, signup will show an error toast and stop submission.
