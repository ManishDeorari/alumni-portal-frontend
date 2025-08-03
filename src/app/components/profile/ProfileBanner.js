import Image from "next/image";
import { Camera } from "lucide-react";

export default function ProfileAvatar({ image, onUpload }) {
  const handleProfileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
    formData.append("public_id", `${process.env.NEXT_PUBLIC_CLOUDINARY_BANNER_PREFIX}/user_${userId}_banner`);

    const uploadRes = await fetch(process.env.NEXT_PUBLIC_CLOUDINARY_IMAGE_UPLOAD_URL, {
      method: "POST",
      body: formData,
    });

    const uploadJson = await uploadRes.json();

    if (uploadRes.ok && uploadJson.secure_url) {
      const token = localStorage.getItem("token");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ profileImage: uploadJson.secure_url }),
      });
      onUpload(); // Refresh profile
    } else {
      console.error("❌ Profile image upload failed:", uploadJson);
    }
  };

  return (
    <div className="relative">
      <Image
        src={image || "/default-profile.png"}
        alt="Profile"
        width={100}
        height={100}
        className="rounded-full border-4 border-white object-cover w-24 h-24"
      />
      <label className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow cursor-pointer">
        <Camera size={18} className="text-gray-700" />
        <input type="file" className="hidden" onChange={handleProfileChange} />
      </label>
    </div>
  );
}
