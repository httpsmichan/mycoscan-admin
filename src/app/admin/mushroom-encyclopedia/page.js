"use client";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function MushroomEncyclopediaPage() {
  const [mushroomName, setMushroomName] = useState("");
  const [description, setDescription] = useState("");
  const [commonNames, setCommonNames] = useState([""]);
  const [habitats, setHabitats] = useState([""]);
  const [culinaryUses, setCulinaryUses] = useState([""]);
  const [medicinalUses, setMedicinalUses] = useState([""]);
  const [funFacts, setFunFacts] = useState([""]);
  const [edibility, setEdibility] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const addField = (setter, values) => setter([...values, ""]);
  const removeField = (setter, values, index) =>
    setter(values.filter((_, i) => i !== index));
  const updateField = (setter, values, index, value) => {
    const newValues = [...values];
    newValues[index] = value;
    setter(newValues);
  };

  const InputRow = ({ values, setter, placeholder }) => (
    <>
      {values.map((val, i) => (
        <div key={i} className="flex items-center gap-2 mb-2 relative">
          <input
            type="text"
            className="border px-3 py-2 rounded w-full pr-10"
            placeholder={placeholder}
            value={val}
            onChange={(e) =>
              updateField(setter, [...values], i, e.target.value)
            }
          />
          {i === 0 ? (
            <button
              type="button"
              className="absolute right-2 px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              onClick={() => addField(setter, values)}
            >
              +
            </button>
          ) : (
            <button
              type="button"
              className="absolute right-2 px-2 py-1 bg-red-200 text-red-700 rounded hover:bg-red-300 text-sm"
              onClick={() => removeField(setter, values, i)}
            >
              –
            </button>
          )}
        </div>
      ))}
    </>
  );

  // Upload images to Cloudinary and save only URLs
  const handleImageUpload = async (e) => {
  const files = Array.from(e.target.files).slice(0, 5);
  const uploadedUrls = [];

  try {
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
        const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
        );

      const data = await res.json();
      console.log("Cloudinary response:", data); 

      if (!data.secure_url) {
        alert("❌ Failed to upload image. See console for details.");
        console.error("Failed Cloudinary response:", data);
        return; 
      }

      uploadedUrls.push(data.secure_url);
    }

    setImages(uploadedUrls); 
  } catch (err) {
    console.error(err);
    alert("❌ Image upload failed");
    setImages([]);
  }
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (images.length === 0) {
      alert("❌ Please upload at least one image");
      setLoading(false);
      return;
    }

    try {
      await addDoc(collection(db, "mushroom-encyclopedia"), {
        mushroomName,
        description,
        commonNames,
        habitats,
        culinaryUses,
        medicinalUses,
        funFacts,
        edibility,
        images, 
        createdAt: serverTimestamp(),
      });

      setMushroomName("");
      setDescription("");
      setCommonNames([""]);
      setHabitats([""]);
      setCulinaryUses([""]);
      setMedicinalUses([""]);
      setFunFacts([""]);
      setEdibility("");
      setImages([]);
      alert("✅ Mushroom entry saved!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save entry");
    }

    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">🍄 Mushroom Encyclopedia</h2>
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Mushroom Name */}
        <div>
          <label className="block font-medium mb-1">Mushroom Name</label>
          <input
            type="text"
            className="border px-3 py-2 rounded w-full"
            placeholder="Enter mushroom name"
            value={mushroomName}
            onChange={(e) => setMushroomName(e.target.value)}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea
            rows="3"
            className="border px-3 py-2 rounded w-full"
            placeholder="Enter description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Common Names */}
        <div>
          <label className="block font-medium mb-1">Common Name(s)</label>
          <InputRow values={commonNames} setter={setCommonNames} placeholder="Enter common name" />
        </div>

        {/* Habitats */}
        <div>
          <label className="block font-medium mb-1">Habitat(s)</label>
          <InputRow values={habitats} setter={setHabitats} placeholder="Enter habitat" />
        </div>

        {/* Edibility */}
        <div>
          <label className="block font-medium mb-1">Edibility</label>
          <select
            className="border px-3 py-2 rounded w-full"
            value={edibility}
            onChange={(e) => setEdibility(e.target.value)}
          >
            <option value="" disabled>Select edibility</option>
            <option value="edible">Edible</option>
            <option value="inedible">Inedible</option>
            <option value="medicinal">Medicinal</option>
            <option value="poisonous">Poisonous</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>

        {/* Culinary Uses */}
        <div>
          <label className="block font-medium mb-1">Culinary Use(s)</label>
          <InputRow values={culinaryUses} setter={setCulinaryUses} placeholder="Enter culinary use" />
        </div>

        {/* Medicinal Uses */}
        <div>
          <label className="block font-medium mb-1">Medicinal Use(s)</label>
          <InputRow values={medicinalUses} setter={setMedicinalUses} placeholder="Enter medicinal use" />
        </div>

        {/* Fun Facts */}
        <div>
          <label className="block font-medium mb-1">Fun Fact(s)</label>
          <InputRow values={funFacts} setter={setFunFacts} placeholder="Enter fun fact" />
        </div>

        {/* Upload Images */}
        <div>
          <label className="block font-medium mb-1">Upload Images (max 5)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="w-full"
          />
          <div className="flex gap-2 mt-2 flex-wrap">
            {images.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`Uploaded ${i}`}
                className="w-24 h-24 object-cover border rounded"
              />
            ))}
          </div>
        </div>

        {/* Save button */}
        <div>
          <button
            type="submit"
            className={`px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${loading ? "opacity-50" : ""}`}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
