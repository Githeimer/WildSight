import React from 'react';
import { Animal, speciesColors } from '../utils/types';

interface AnimalSelectorProps {
  animals: Animal[];
  selectedAnimalId: number | null;
  onAnimalChange: (animalId: number | null) => void;
}

const AnimalSelector: React.FC<AnimalSelectorProps> = ({
  animals,
  selectedAnimalId,
  onAnimalChange
}) => {
  return (
    <div className="w-full md:w-auto">
      <div className="text-sm font-medium text-gray-700 mb-2">Filter by Animal</div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onAnimalChange(null)}
          className={`px-3 py-1.5 rounded-full text-sm ${
            selectedAnimalId === null
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          All Animals
        </button>
        
        {animals.map(animal => (
          <button
            key={animal.id}
            onClick={() => onAnimalChange(animal.id)}
            className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 ${
              selectedAnimalId === animal.id
                ? 'text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
            style={{
              backgroundColor: selectedAnimalId === animal.id 
                ? speciesColors[animal.species] || speciesColors.default
                : undefined
            }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{
                backgroundColor: speciesColors[animal.species] || speciesColors.default,
                display: selectedAnimalId === animal.id ? 'none' : 'inline-block'
              }}
            ></span>
            {animal.tag_id}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AnimalSelector;