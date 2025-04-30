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

  if (loading) {
    return <p className="text-muted-foreground px-4">Loading animals...</p>;
  }

  return (
    <div className="w-full px-6 py-4 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-semibold">Tracked Animals</h1>
        <div className="w-[200px]">
          <Select value={filteredSpecies} onValueChange={setFilteredSpecies}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Species" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Species</SelectItem>
              {uniqueSpecies.map((species) => (
                <SelectItem key={species} value={species}>
                  {species}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="w-full overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tag ID</TableHead>
              <TableHead>Species</TableHead>
              <TableHead>Birth Date</TableHead>
              <TableHead>Weight (kg)</TableHead>
              <TableHead>Device ID</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((animal) => (
              <TableRow
                key={animal.id}
                className="hover:bg-muted/50 cursor-pointer"
                onClick={() =>
                  window.location.href = `/livetracking?animal_id=${animal.id}`
                }
              >
                <TableCell className="font-medium">{animal.tag_id}</TableCell>
                <TableCell>{animal.species}</TableCell>
                <TableCell>
                  {animal.birth_date
                    ? new Date(animal.birth_date).toLocaleDateString()
                    : "—"}
                </TableCell>
                <TableCell>
                  {animal.weight != null ? animal.weight.toFixed(2) : "—"}
                </TableCell>
                <TableCell>{animal.device_id ?? "—"}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {animal.notes || "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
