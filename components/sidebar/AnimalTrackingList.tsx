"use client";

import React, { useState, useEffect } from 'react';
// Removed useRouter as it's not used
// import { useRouter } from 'next/navigation'; 
import { 
  // Removed icons not used in the simplified list:
  // Search, 
  // Filter, 
  // ChevronDown, 
  // MapPin, 
  // Battery, 
  // AlertTriangle,
  // X
  Calendar // Keep Calendar for updated_at
} from "lucide-react";
import { cn } from "@/lib/utils";

// Import necessary shadcn UI components
// Removed Input, Button, Badge (unless needed later), DropdownMenu*, Select*
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Type definitions matching the database schema from the image
export interface Animal {
  id: number;          // int4
  tag_id: string;      // varchar
  species: string;     // varchar
  birth_date: string | null; // date (string is safer for transport)
  sex: string | null;        // varchar
  weight: number | null;     // numeric (use number in TS)
  notes: string | null;      // text
  updated_at: string;  // timestamptz (ISO string)
  device_id: number | null;  // int4
}

// Interface for component props - keeping flexibility
export interface AnimalTrackingListProps {
  animals?: Animal[]; // Allow passing animals externally
  isLoading?: boolean; // Allow passing loading state externally
  onAnimalSelect?: (animal: Animal) => void; // Callback when an animal row is clicked
  className?: string;
}

// Custom hook for fetching animal data - updated for new schema
const useAnimals = () => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        setIsLoading(true);
        setError(null); // Reset error on new fetch
        // Use the specified API endpoint
        const response = await fetch('/api/animals/all'); 
        
        if (!response.ok) {
          throw new Error(`Failed to fetch animals: ${response.statusText}`);
        }
        
        const data = await response.json();
        // TODO: Add validation here to ensure data matches the Animal interface
        setAnimals(data); 
      } catch (err) {
        console.error("Error fetching animals:", err); // Log the actual error
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        setAnimals([]); // Clear animals on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnimals();
  }, []); // Empty dependency array means fetch only once on mount

  return { animals, isLoading, error };
};

// --- Removed Demo Data as it doesn't match the new schema ---

// --- Removed Filter and Sorting Types ---

const AnimalTrackingList: React.FC<AnimalTrackingListProps> = ({
  animals: externalAnimals,
  isLoading: externalIsLoading,
  onAnimalSelect,
  className
}) => {
  // Use provided animals or fetch them if not provided
  const { animals: fetchedAnimals, isLoading: fetchIsLoading, error } = 
    !externalAnimals ? useAnimals() : { animals: [], isLoading: false, error: null };
  
  // Determine which animals and loading state to use
  const animals = externalAnimals || fetchedAnimals;
  const isLoading = externalIsLoading !== undefined ? externalIsLoading : fetchIsLoading;

  // --- Removed state for search, filters, sorting ---
  // --- Removed useEffect for filtering/sorting ---

  // --- Removed filter change handlers ---
  // --- Removed clearAllFilters ---
  // --- Removed search change handler ---
  // --- Removed sort handlers ---

  // Format date for display (simplified for updated_at)
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      // Example format: Jan 1, 2023, 10:30 AM - adjust as needed
      return date.toLocaleString(undefined, { 
        dateStyle: 'medium', 
        timeStyle: 'short' 
      });
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return dateString; // Return original string if formatting fails
    }
  };

  // --- Removed renderStatusBadge ---
  // --- Removed renderBatteryLevel ---

  // Handler for clicking on an animal row
  const handleAnimalClick = (animal: Animal) => {
    if (onAnimalSelect) {
      onAnimalSelect(animal);
    }
    // Add navigation or other actions here if needed
    // e.g., router.push(`/animals/${animal.id}`);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* --- Removed Search and filter bar --- */}
      {/* --- Removed Active filters display --- */}
      
      {/* Error display */}
      {error && !isLoading && ( // Only show error if not loading
        <div className="p-4 border border-red-200 bg-red-50 rounded-md text-red-800">
          <p>Error loading animal data: {error.message}</p>
          <p>Please try refreshing the page or contact support.</p>
        </div>
      )}
      
      {/* Animal list */}
      {isLoading ? (
        <div className="py-32 text-center text-gray-500">
          Loading animals...
        </div>
      ) : !error && animals.length === 0 ? ( // Show no animals message only if no error
        <div className="py-32 text-center text-gray-500">
          No animals found.
        </div>
      ) : !error && animals.length > 0 ? ( // Only render table if no error and animals exist
        <div className="border rounded-md overflow-x-auto"> {/* Added overflow for smaller screens */}
          <Table>
            <TableHeader>
              <TableRow>
                {/* Updated Table Heads based on new schema */}
                <TableHead>ID</TableHead>
                <TableHead>Tag ID</TableHead>
                <TableHead>Species</TableHead>
                <TableHead>Sex</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Device ID</TableHead>
                <TableHead>Last Updated</TableHead>
                {/* Add other relevant columns like birth_date or notes if needed */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {animals.map(animal => (
                <TableRow 
                  key={animal.id}
                  className={cn(
                    "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800" 
                    // Removed alert styling
                  )}
                  onClick={() => handleAnimalClick(animal)}
                >
                  {/* Updated Table Cells based on new schema */}
                  <TableCell className="font-medium">{animal.id}</TableCell>
                  <TableCell>{animal.tag_id || 'N/A'}</TableCell>
                  <TableCell>{animal.species || 'N/A'}</TableCell>
                  <TableCell>{animal.sex || 'N/A'}</TableCell>
                  <TableCell>{animal.weight !== null ? `${animal.weight} kg` : 'N/A'}</TableCell> {/* Added units */}
                  <TableCell>{animal.device_id || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      {formatDate(animal.updated_at)}
                    </div>
                  </TableCell>
                  {/* Removed Location, Status, Battery cells */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null /* Render nothing if error occurred and handled above */}
      
      {/* --- Removed Results count --- */}
    </div>
  );
};

export default AnimalTrackingList;