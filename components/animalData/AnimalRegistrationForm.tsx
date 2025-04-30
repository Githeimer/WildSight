"use client";
import { useState, useEffect, ChangeEvent, MouseEvent } from "react";
import { Calendar, Check, AlertCircle, Loader2 } from "lucide-react";
import axios from "axios";

// Data interfaces
interface AnimalFormData {
  tag_id: string;
  species: string;
  birth_date: string;
  sex: string;
  weight: number | null;
  notes: string;
  device_id: string;
}

interface Device {
  id: string;
  name: string;
}

interface FormErrors {
  tag_id?: string;
  species?: string;
  weight?: string;
  device_id?: string;
  [key: string]: string | undefined;
}

interface ApiSuccessResponse {
  message: string;
  animal: AnimalFormData & { id: number; created_at: string };
}

interface ApiErrorResponse {
  error: string;
}

type ApiResponse = ApiSuccessResponse | ApiErrorResponse;

const AnimalRegistrationForm = () => {
  const [formData, setFormData] = useState<AnimalFormData>({
    tag_id: "",
    species: "",
    birth_date: "",
    sex: "",
    weight: null,
    notes: "",
    device_id: ""
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiErrorMessage, setApiErrorMessage] = useState<string>("");
  const [availableDevices, setAvailableDevices] = useState<Device[]>([]);

  const speciesOptions: string[] = [
    "Tiger", "Wolf", "Bear", "Elephant", "Lion",
    "Giraffe", "Rhino", "Gorilla", "Panda", "Zebra"
  ];

  useEffect(() => {
    getAvailableDevices();
  }, []);

  const getAvailableDevices = async () => {
    try {
      const response = await axios.get('/api/devices');
      console.log(response.data)
      setAvailableDevices(response.data || []);
    } catch (error) {
      console.error("Error fetching devices:", error);
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    let processedValue: string | number | null = value;

    if (name === "weight") {
      processedValue = value === "" ? null : parseFloat(value);
    }

    setFormData({
      ...formData,
      [name]: processedValue
    });

    if (errors[name]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!formData.tag_id.trim()) newErrors.tag_id = "Tag ID is required";
    if (!formData.species) newErrors.species = "Species is required";
    if (!formData.device_id) newErrors.device_id = "Device selection is required";
    if (formData.weight !== null && (isNaN(formData.weight) || formData.weight <= 0))
      newErrors.weight = "Weight must be a positive number";

    return newErrors;
  };

  const resetForm = () => {
    setFormData({
      tag_id: "",
      species: "",
      birth_date: "",
      sex: "",
      weight: null,
      notes: "",
      device_id: ""
    });
    setErrors({});
    setApiErrorMessage("");
  };

  const handleSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setSubmitStatus(null);
    setApiErrorMessage("");

    try {
      const animalData: AnimalFormData = {
        tag_id: formData.tag_id,
        species: formData.species,
        birth_date: formData.birth_date || "",
        sex: formData.sex || "",
        weight: formData.weight,
        notes: formData.notes || "",
        device_id: formData.device_id
      };

      const response = await fetch('/api/animal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(animalData),
      });

      const result = await response.json() as ApiResponse;

      if (!response.ok) {
        const errorResult = result as ApiErrorResponse;
        setApiErrorMessage(errorResult.error || 'Failed to register animal');
        throw new Error(errorResult.error || 'Failed to register animal');
      }

      console.log("API Response:", result);
      setSubmitStatus("success");

      setTimeout(() => {
        setSubmitStatus(null);
        resetForm();
      }, 3000);
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-green-800">Wildlife Registration</h2>
        <p className="text-gray-500 mt-1">Record new animal data in the conservation database</p>
      </div>

      {submitStatus === "success" && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded flex items-center">
          <Check className="h-5 w-5 text-green-500 mr-2" />
          <span>Animal successfully registered in the database!</span>
        </div>
      )}

      {submitStatus === "error" && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span>
            Failed to register animal. {apiErrorMessage ? apiErrorMessage : "Please try again."}
          </span>
        </div>
      )}

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Tag ID */}
          <div className="space-y-2">
            <label htmlFor="tag_id" className="text-sm font-medium text-gray-700">
              Tag ID <span className="text-red-500">*</span>
            </label>
            <input
              id="tag_id"
              name="tag_id"
              type="text"
              value={formData.tag_id}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm ${errors.tag_id ? "border-red-300" : "border-gray-300"}`}
              placeholder="e.g. TGR-001"
            />
            {errors.tag_id && <p className="text-sm text-red-600">{errors.tag_id}</p>}
          </div>

          {/* Species */}
          <div className="space-y-2">
            <label htmlFor="species" className="text-sm font-medium text-gray-700">
              Species <span className="text-red-500">*</span>
            </label>
            <select
              id="species"
              name="species"
              value={formData.species}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm ${errors.species ? "border-red-300" : "border-gray-300"}`}
            >
              <option value="">Select species</option>
              {speciesOptions.map((species) => (
                <option key={species} value={species}>{species}</option>
              ))}
            </select>
            {errors.species && <p className="text-sm text-red-600">{errors.species}</p>}
          </div>

          {/* Device Select */}
          <div className="space-y-2">
            <label htmlFor="device_id" className="text-sm font-medium text-gray-700">
              Select Device <span className="text-red-500">*</span>
            </label>
            <select
              id="device_id"
              name="device_id"
              value={formData.device_id}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm ${errors.device_id ? "border-red-300" : "border-gray-300"}`}
            >
              <option value="">-- Select a device --</option>
              {availableDevices.map((device:any) => (
                <option key={device.id} value={device.id}>
                  {device.serial_number}
                </option>
              ))}
            </select>
            {errors.device_id && <p className="text-sm text-red-600">{errors.device_id}</p>}
          </div>

          {/* Birth Date */}
          <div className="space-y-2">
            <label htmlFor="birth_date" className="text-sm font-medium text-gray-700">Birth Date</label>
            <input
              id="birth_date"
              name="birth_date"
              type="date"
              value={formData.birth_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm"
            />
          </div>

          {/* Sex */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Sex</label>
            <div className="flex gap-4">
              {["Male", "Female"].map((option) => (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="sex"
                    value={option}
                    checked={formData.sex === option}
                    onChange={handleChange}
                    className="text-green-600 border-gray-300 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Weight */}
          <div className="space-y-2">
            <label htmlFor="weight" className="text-sm font-medium text-gray-700">Weight (kg)</label>
            <input
              id="weight"
              name="weight"
              type="number"
              step="0.01"
              value={formData.weight === null ? "" : formData.weight}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm ${errors.weight ? "border-red-300" : "border-gray-300"}`}
              placeholder="0.00"
            />
            {errors.weight && <p className="text-sm text-red-600">{errors.weight}</p>}
          </div>

          {/* Notes */}
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="notes" className="text-sm font-medium text-gray-700">Notes</label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm"
              placeholder="Health, special markings, etc."
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            disabled={isLoading}
          >
            Clear
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 flex items-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Register Animal"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AnimalRegistrationForm;
