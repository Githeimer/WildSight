"use client";

import React, { useState, useEffect } from 'react';
import { 
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

// Import necessary shadcn UI components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Type definitions matching the database schema
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

// Interface for component props
export interface AnimalTrackingListProps {
  animals?: Animal[]; // Allow passing animals externally
  isLoading?: boolean; // Allow passing loading state externally
  onAnimalSelect?: (animal: Animal) => void; // Callback when an animal row is clicked
  className?: string;
}

// Enhanced custom hook for fetching animal data
const useAnimals = () => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log("Fetching animals from API...");
        
        // Make the API request
        const response = await fetch('/api/animal/all');
        
        // Handle non-OK response
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status} ${response.statusText}`);
        }
        
        // Parse the JSON response
        const data = await response.json();
        
        // Check if data is an array
        if (!Array.isArray(data)) {
          console.warn("API did not return an array:", data);
          
          // If the API returned an error object, throw it
          if (data.error) {
            throw new Error(`API error: ${data.error}`);
          }
          
          // Default to empty array for safety
          setAnimals([]);
          return;
        }
        
        console.log(`Received ${data.length} animals from API`);
        setAnimals(data);
      } catch (err) {
        console.error("Error in useAnimals hook:", err);
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        setAnimals([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnimals();
  }, []);

  return { animals, isLoading, error };
};

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

  // Format date for display
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString(undefined, { 
        dateStyle: 'medium', 
        timeStyle: 'short' 
      });
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return dateString; // Return original string if formatting fails
    }
  };

  // Handler for clicking on an animal row
  const handleAnimalClick = (animal: Animal) => {
    if (onAnimalSelect) {
      onAnimalSelect(animal);
    }
  };

  // Determine content state message
  let contentState = null;
  
  if (isLoading) {
    contentState = (
      <div className="py-32 text-center text-gray-500">
        <div className="inline-block animate-spin mr-2">⏳</div> Loading animals...
      </div>
    );
  } else if (error) {
    contentState = (
      <div className="p-6 border border-red-200 bg-red-50 rounded-md text-red-800">
        <p className="font-semibold">Error loading animal data:</p>
        <p className="mt-2">{error.message}</p>
        <p className="mt-4">Please try refreshing the page or contact technical support.</p>
      </div>
    );
  } else if (animals.length === 0) {
    contentState = (
      <div className="py-32 text-center text-gray-500">
        No animals found in the database.
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Optional: Add status message at the top */}
      {!isLoading && !error && animals.length > 0 && (
        <div className="text-sm text-gray-500">
          Showing {animals.length} animals
        </div>
      )}
      
      {/* Error, loading, or empty state */}
      {contentState}
      
      {/* Animal table - only render when we have animals and no errors */}
      {!isLoading && !error && animals.length > 0 && (
        <div className="border rounded-md overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Tag ID</TableHead>
                <TableHead>Species</TableHead>
                <TableHead>Sex</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Device ID</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {animals.map(animal => (
                <TableRow 
                  key={animal.id}
                  className={cn(
                    "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  )}
                  onClick={() => handleAnimalClick(animal)}
                >
                  <TableCell className="font-medium">{animal.id}</TableCell>
                  <TableCell>{animal.tag_id || 'N/A'}</TableCell>
                  <TableCell>{animal.species || 'N/A'}</TableCell>
                  <TableCell>{animal.sex || 'N/A'}</TableCell>
                  <TableCell>{animal.weight !== null ? `${animal.weight} kg` : 'N/A'}</TableCell>
                  <TableCell>{animal.device_id || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      {formatDate(animal.updated_at)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AnimalTrackingList;