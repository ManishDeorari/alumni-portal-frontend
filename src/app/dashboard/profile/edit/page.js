"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function EditProfilePage() {
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    job: "",
    course: "",
    year: "",
    profilePicture: ""
  });

  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Load current user data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/api/user/me");
        setFormData({
          name: res.data.name || "",
          bio: res.data.bio || "",
          job: res.data.job || "",
          course: res.data.course || "",
          year: res.data.year || "",
          profilePicture: res.data.profilePicture || ""
        });
        setPreview(res.data.profilePicture || "");
      } catch (err) {
        toast.error("Failed to load profile");
      }
    };
    fetchProfile();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Handle Cloudinary image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", "alumni_uploads");


    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/djw8l0wxn/image/upload", {
        method: "POST",
        body: form
      });
      const data = await res.json();
      setFormData((prev) => ({ ...prev, profilePicture: data.secure_url }));
      setPreview(data.secure_url);
      toast.success("Image uploaded!");
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put("/api/user/update", formData);
      toast.success("Profile updated!");
      router.push("/dashboard/profile");
    } catch (err) {
      toast.error("Update failed");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Your Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-md">
        <div>
          <label className="block mb-1 font-medium">Name</label>
          <Input name="name" value={formData.name} onChange={handleChange} />
        </div>

        <div>
          <label className="block mb-1 font-medium">Bio</label>
          <Textarea name="bio" value={formData.bio} onChange={handleChange} />
        </div>

        <div>
          <label className="block mb-1 font-medium">Job Title</label>
          <Input name="job" value={formData.job} onChange={handleChange} />
        </div>

        <div>
          <label className="block mb-1 font-medium">Course</label>
          <Input name="course" value={formData.course} onChange={handleChange} />
        </div>

        <div>
          <label className="block mb-1 font-medium">Graduation Year</label>
          <Input name="year" value={formData.year} onChange={handleChange} />
        </div>

        <div>
          <label className="block mb-1 font-medium">Profile Picture</label>
          <Input type="file" accept="image/*" onChange={handleImageUpload} />
          {preview && (
            <img
              src={preview}
              alt="Profile Preview"
              className="w-24 h-24 mt-2 rounded-full object-cover border"
            />
          )}
        </div>

        <div className="flex justify-between items-center">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Update Profile"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/dashboard/profile")}>
            Back to Profile
          </Button>
        </div>
      </form>
    </div>
  );
}
