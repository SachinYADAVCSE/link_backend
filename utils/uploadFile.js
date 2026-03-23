export const uploadFile = async (file) => {
    const formData = new FormData();
  
    formData.append("file", file);
    formData.append("upload_preset", "liinks_upload");
  
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/dkwmjel64/auto/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
  
    const data = await res.json();
  
    return data.secure_url; // ⭐ THIS is what you save in DB
  };
  