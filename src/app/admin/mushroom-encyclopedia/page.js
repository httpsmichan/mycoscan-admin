"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

const InputRow = ({ values, setter, placeholder, keyPrefix, addField, removeField, updateField }) => {
  return (
    <>
      {values.map((val, i) => (
        <div key={`${keyPrefix}-${i}`} className="flex items-center gap-2 mb-2 relative">
          <input
            type="text"
            className="border px-3 py-2 rounded w-full pr-10"
            placeholder={placeholder}
            value={val}
            onChange={(e) => updateField(setter, i, e.target.value)}
          />
          {i === 0 ? (
            <button
              type="button"
              className="absolute right-2 px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              onClick={() => addField(setter)}
            >
              +
            </button>
          ) : (
            <button
              type="button"
              className="absolute right-2 px-2 py-1 bg-red-200 text-red-700 rounded hover:bg-red-300 text-sm"
              onClick={() => removeField(setter, i)}
            >
              –
            </button>
          )}
        </div>
      ))}
    </>
  );
};

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

  const [toxicity, setToxicity] = useState([""]);
  const [onset, setOnset] = useState([""]);
  const [duration, setDuration] = useState([""]);
  const [longTerm, setLongTerm] = useState([""]);

  const [reason, setReason] = useState("");

  // Firestore
  const [mushrooms, setMushrooms] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  // helpers
  const addField = (setter) => setter((prev) => [...prev, ""]);
  const removeField = (setter, index) => setter((prev) => prev.filter((_, i) => i !== index));
  const updateField = (setter, index, value) =>
    setter((prev) => {
      const newValues = [...prev];
      newValues[index] = value;
      return newValues;
    });

  // fetch mushrooms
  const fetchData = async () => {
    const querySnapshot = await getDocs(collection(db, "mushroom-encyclopedia"));
    const items = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setMushrooms(items);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // clear all fields (for new entry)
  const clearForm = () => {
    setMushroomName("");
    setDescription("");
    setCommonNames([""]);
    setHabitats([""]);
    setCulinaryUses([""]);
    setMedicinalUses([""]);
    setFunFacts([""]);
    setEdibility("");
    setImages([]);
    setToxicity([""]);
    setOnset([""]);
    setDuration([""]);
    setLongTerm([""]);
    setReason("");
    setSelectedId(null);
  };

  // when selecting mushroom
  const handleSelect = (m) => {
    setSelectedId(m.id);
    setMushroomName(m.mushroomName || "");
    setDescription(m.description || "");
    setCommonNames(m.commonNames || [""]);
    setHabitats(m.habitats || [""]);
    setCulinaryUses(m.culinaryUses || [""]);
    setMedicinalUses(m.medicinalUses || [""]);
    setFunFacts(m.funFacts || [""]);
    setEdibility(m.edibility || "");
    setImages(m.images || []);
    setToxicity(m.toxicity || [""]);
    setOnset(m.onset || [""]);
    setDuration(m.duration || [""]);
    setLongTerm(m.longTerm || [""]);
    setReason(m.reason || "");
  };

  // submit new or update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const baseData = {
      mushroomName,
      description,
      commonNames,
      habitats,
      funFacts,
      edibility,
      images,
      createdAt: serverTimestamp(),
    };

    let extraData = {};
    if (edibility === "poisonous") {
      extraData = { reason, toxicity, onset, duration, longTerm };
    } else if (["ediblew", "inedible", "inediblemed"].includes(edibility)) {
      extraData = { reason, culinaryUses, medicinalUses };
    } else {
      extraData = { culinaryUses, medicinalUses };
    }

    try {
      if (selectedId) {
        const ref = doc(db, "mushroom-encyclopedia", selectedId);
        await updateDoc(ref, { ...baseData, ...extraData });
        alert("✅ Mushroom updated!");
      } else {
        await addDoc(collection(db, "mushroom-encyclopedia"), { ...baseData, ...extraData });
        alert("✅ Mushroom added!");
      }
      clearForm();
      fetchData();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save entry");
    }
    setLoading(false);
  };

  // delete
  const handleDelete = async () => {
    if (!selectedId) return;
    if (!confirm("Delete this mushroom?")) return;
    try {
      await deleteDoc(doc(db, "mushroom-encyclopedia", selectedId));
      alert("🗑️ Deleted!");
      clearForm();
      fetchData();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to delete entry");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">🍄 Mushroom Encyclopedia</h2>
        <button
          type="button"
          onClick={clearForm}
          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
        >
          + Add New
        </button>
      </div>

      {/* Mushroom list */}
      <div className="flex flex-wrap gap-2 text-sm mb-10">
        {mushrooms.map((m) => (
          <button
            key={m.id}
            onClick={() => handleSelect(m)}
            className={`px-3 py-1 border rounded ${selectedId === m.id ? "bg-blue-200" : "bg-gray-100"}`}
          >
            {m.mushroomName}
          </button>
        ))}
      </div>

      {/* Full Form */}
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Name */}
        <div>
          <label className="block font-medium mb-1">Mushroom Name</label>
          <input
            type="text"
            className="border px-3 py-2 rounded w-full"
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
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Common Names */}
        <div>
          <label className="block font-medium mb-1">Common Name(s)</label>
          <InputRow values={commonNames} setter={setCommonNames} placeholder="Enter common name" keyPrefix="common-names" addField={addField} removeField={removeField} updateField={updateField} />
        </div>

        {/* Habitats */}
        <div>
          <label className="block font-medium mb-1">Habitat(s)</label>
          <InputRow values={habitats} setter={setHabitats} placeholder="Enter habitat" keyPrefix="habitats" addField={addField} removeField={removeField} updateField={updateField} />
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
            <option value="ediblew">Edible (with caution)</option>
            <option value="inedible">Inedible</option>
            <option value="inediblemed">Inedible (medicinal)</option>
            <option value="medicinal">Medicinal</option>
            <option value="poisonous">Poisonous</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>

        {/* Conditional Fields */}
        {edibility === "poisonous" ? (
          <>
            <div>
              <label className="block font-medium mb-1">Reason</label>
              <input type="text" className="border px-3 py-2 rounded w-full" value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
            <div>
              <label className="block font-medium mb-1">Toxicity</label>
              <InputRow values={toxicity} setter={setToxicity} placeholder="Enter toxicity info" keyPrefix="toxicity" addField={addField} removeField={removeField} updateField={updateField} />
            </div>
            <div>
              <label className="block font-medium mb-1">Onset of Symptoms</label>
              <InputRow values={onset} setter={setOnset} placeholder="Enter onset of symptoms" keyPrefix="onset" addField={addField} removeField={removeField} updateField={updateField} />
            </div>
            <div>
              <label className="block font-medium mb-1">Duration of Effects</label>
              <InputRow values={duration} setter={setDuration} placeholder="Enter duration of effects" keyPrefix="duration" addField={addField} removeField={removeField} updateField={updateField} />
            </div>
            <div>
              <label className="block font-medium mb-1">Long-term Effects</label>
              <InputRow values={longTerm} setter={setLongTerm} placeholder="Enter long-term effects" keyPrefix="long-term" addField={addField} removeField={removeField} updateField={updateField} />
            </div>
          </>
        ) : ["ediblew", "inedible", "inediblemed"].includes(edibility) ? (
          <>
            <div>
              <label className="block font-medium mb-1">Reason</label>
              <input type="text" className="border px-3 py-2 rounded w-full" value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
            <div>
              <label className="block font-medium mb-1">Culinary Use(s)</label>
              <InputRow values={culinaryUses} setter={setCulinaryUses} placeholder="Enter culinary use" keyPrefix="culinary-uses" addField={addField} removeField={removeField} updateField={updateField} />
            </div>
            <div>
              <label className="block font-medium mb-1">Medicinal Use(s)</label>
              <InputRow values={medicinalUses} setter={setMedicinalUses} placeholder="Enter medicinal use" keyPrefix="medicinal-uses" addField={addField} removeField={removeField} updateField={updateField} />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block font-medium mb-1">Culinary Use(s)</label>
              <InputRow values={culinaryUses} setter={setCulinaryUses} placeholder="Enter culinary use" keyPrefix="culinary-uses" addField={addField} removeField={removeField} updateField={updateField} />
            </div>
            <div>
              <label className="block font-medium mb-1">Medicinal Use(s)</label>
              <InputRow values={medicinalUses} setter={setMedicinalUses} placeholder="Enter medicinal use" keyPrefix="medicinal-uses" addField={addField} removeField={removeField} updateField={updateField} />
            </div>
          </>
        )}

        {/* Fun Facts */}
        <div>
          <label className="block font-medium mb-1">Fun Fact(s)</label>
          <InputRow values={funFacts} setter={setFunFacts} placeholder="Enter fun fact" keyPrefix="fun-facts" addField={addField} removeField={removeField} updateField={updateField} />
        </div>

        {/* Images */}
        <div>
          <label className="block font-medium mb-1">Image URLs (paste links)</label>
          <InputRow values={images} setter={setImages} placeholder="Enter image URL" keyPrefix="images" addField={addField} removeField={removeField} updateField={updateField} />
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            type="submit"
            className={`px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${loading ? "opacity-50" : ""}`}
            disabled={loading}
          >
            {selectedId ? "Update" : "Save"}
          </button>
          {selectedId && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-5 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
