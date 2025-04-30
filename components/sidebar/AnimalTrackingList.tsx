"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Cat,
  Dog,
  Fish,
  Bird,
//   Bear,
//   Rabbit,
//   Fox,
//   Paw,
  ChevronRight,
  Scale,
  CalendarDays,
  StickyNote,
  Tag,
  Wifi,
} from "lucide-react";

interface Animal {
  id: number;
  tag_id: string;
  species: string;
  birth_date?: string;
  sex?: string;
  weight?: number;
  notes?: string;
  device_id?: number;
}

export default function AnimalTable() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [filteredSpecies, setFilteredSpecies] = useState("__all__");
  const [loading, setLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        const res = await fetch("/api/animal/all");
        const data = await res.json();
        setAnimals(data);
      } catch (err) {
        console.error("Failed to fetch animals", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimals();
  }, []);

  const uniqueSpecies = Array.from(new Set(animals.map((a) => a.species)));
  const filtered = animals.filter((a) =>
    filteredSpecies === "__all__" ? true : a.species === filteredSpecies
  );

  const getSpeciesIcon = (species: string) => {
    switch (species.toLowerCase()) {
      case "cat":
        return <Cat size={18} />;
      case "dog":
        return <Dog size={18} />;
      case "fish":
        return <Fish size={18} />;
      case "bird":
        return <Bird size={18} />;
      case "bear":
    //     return <Bear size={18} />;
    //   case "rabbit":
    //     return <Rabbit size={18} />;
    //   case "fox":
    //     return <Fox size={18} />;
    //   default:
    //     return <Paw size={18} />;
    }
  };

  const getSpeciesColor = (species: string) => {
    switch (species.toLowerCase()) {
      case "cat":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "dog":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "fish":
        return "bg-cyan-100 text-cyan-800 border-cyan-300";
      case "bird":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "bear":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "rabbit":
        return "bg-pink-100 text-pink-800 border-pink-300";
      case "fox":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex flex-col items-center gap-2">
          {/* <Paw size={36} className="text-gray-400" /> */}
          <p className="text-muted-foreground">Loading animals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-6 py-4 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          {/* <Paw size={28} className="text-primary" /> */}
          <h1 className="text-3xl font-semibold">Tracked Animals</h1>
        </div>
        <div className="w-[220px]">
          <Select value={filteredSpecies} onValueChange={setFilteredSpecies}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Filter by Species" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">
                <div className="flex items-center gap-2">
                  {/* <Paw size={16} /> */}
                  <span>All Species</span>
                </div>
              </SelectItem>
              {uniqueSpecies.map((species) => (
                <SelectItem key={species} value={species}>
                  <div className="flex items-center gap-2">
                    {getSpeciesIcon(species)}
                    <span>{species}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg shadow-sm border border-blue-100">
        <div className="text-sm text-gray-600 mb-1">Currently tracking</div>
        <div className="flex gap-3 flex-wrap">
          {uniqueSpecies.map((species) => {
            const count = animals.filter((a) => a.species === species).length;
            return (
              <Badge
                key={species}
                className={`flex items-center gap-1 py-1 px-3 border ${getSpeciesColor(
                  species
                )}`}
                variant="outline"
                onClick={() => setFilteredSpecies(species)}
              >
                {getSpeciesIcon(species)}
                <span>
                  {count} {species}
                </span>
              </Badge>
            );
          })}
        </div>
      </div>

      <div className="w-full overflow-hidden rounded-xl border shadow-sm bg-white">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[100px]">
                <div className="flex items-center gap-2">
                  <Tag size={14} />
                  <span>Tag ID</span>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  {/* <Paw size={14} /> */}
                  <span>Species</span>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  <CalendarDays size={14} />
                  <span>Birth Date</span>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  <Scale size={14} />
                  <span>Weight (kg)</span>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  <Wifi size={14} />
                  <span>Device ID</span>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  <StickyNote size={14} />
                  <span>Notes</span>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((animal) => (
              <TableRow
                key={animal.id}
                className={`hover:bg-blue-50 cursor-pointer transition-colors ${
                  selectedRow === animal.id ? "bg-blue-50" : ""
                }`}
                onClick={() => {
                  setSelectedRow(animal.id);
                  window.location.href = `/livetracking?animal_id=${animal.id}`;
                }}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-gray-50">
                      {animal.tag_id}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getSpeciesIcon(animal.species)}
                    <Badge
                      className={`${getSpeciesColor(
                        animal.species
                      )} border px-2 py-0.5`}
                      variant="outline"
                    >
                      {animal.species}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  {animal.birth_date ? (
                    <div className="flex items-center gap-2">
                      <CalendarDays size={14} className="text-gray-500" />
                      <span>
                        {new Date(animal.birth_date).toLocaleDateString()}
                      </span>
                    </div>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  {animal.weight != null ? (
                    <div className="flex items-center gap-2">
                      <Scale size={14} className="text-gray-500" />
                      <span>{animal.weight.toFixed(2)}</span>
                    </div>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  {animal.device_id ? (
                    <div className="flex items-center gap-2">
                      <Wifi
                        size={14}
                        className={
                          animal.device_id ? "text-green-500" : "text-gray-400"
                        }
                      />
                      <Badge
                        variant="outline"
                        className={
                          animal.device_id
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-gray-50"
                        }
                      >
                        {animal.device_id}
                      </Badge>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Wifi size={14} className="text-gray-300" />
                      <span className="text-gray-400">No device</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="max-w-xs">
                  <div className="flex items-center gap-2 group">
                    <StickyNote
                      size={14}
                      className={
                        animal.notes ? "text-gray-600" : "text-gray-300"
                      }
                    />
                    <div className="truncate">
                      {animal.notes || "No notes"}
                      {animal.notes && (
                        <span
                          className="tooltip absolute bg-black text-white text-xs rounded py-1 px-2 -mt-12 whitespace-normal max-w-xs opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          style={{ pointerEvents: "none" }}
                        >
                          {animal.notes}
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center text-gray-500">
            {/* <Paw size={36} className="mb-2 opacity-20" /> */}
            <p>No animals found</p>
            {filteredSpecies !== "__all__" && (
              <button
                className="mt-2 text-blue-500 hover:underline flex items-center gap-1"
                onClick={() => setFilteredSpecies("__all__")}
              >
                <span>Show all animals</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}