"use client";

import { useState } from "react";
import glossaryData from "@/app/data/glossary.json";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GlossaryData {
  glossary: {
    term: string;
    slug: string;
    category: string;
    definition: string;
    relatedTerms: string[];
    keywords: string[];
  }[];
}

export default function GlossaryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedKeyword, setSelectedKeyword] = useState("");

  const categories = Array.from(
    new Set(
      (glossaryData as GlossaryData).glossary.map((entry) => entry.category),
    ),
  ) as string[];

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category === selectedCategory ? "all" : category);
  };

  const handleKeywordClick = (keyword: string) => {
    if (selectedKeyword === keyword) {
      setSelectedKeyword("");
      setSearchQuery("");
    } else {
      setSelectedKeyword(keyword);
      setSearchQuery(keyword);
    }
  };

  const filteredEntries = (glossaryData as GlossaryData).glossary.filter(
    (entry) => {
      const matchesSearch =
        entry.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.keywords.some((keyword) =>
          keyword.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      const matchesCategory =
        selectedCategory === "all" || entry.category === selectedCategory;
      const matchesKeyword =
        !selectedKeyword ||
        entry.keywords.some(
          (keyword) => keyword.toLowerCase() === selectedKeyword.toLowerCase(),
        );
      return matchesSearch && matchesCategory && matchesKeyword;
    },
  );

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="text-center mb-12 prose dark:prose-invert mx-auto">
        <h1 className="mb-4">AI Glossary</h1>
        <p className="text-gray-600 dark:text-gray-400 lead">
          Explore and understand AI terminology
        </p>
      </div>

      <div className="glass p-8 rounded-xl mb-8 backdrop-blur-sm">
        {selectedKeyword && (
          <div className="flex items-center gap-2 mb-6">
            <Badge variant="default" className="px-3 py-1">
              #{selectedKeyword}
            </Badge>
            <button
              onClick={() => {
                setSelectedKeyword("");
                setSearchQuery("");
              }}
              className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              Clear filter
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium ml-1">Search</label>
            <Input
              type="text"
              placeholder="Search terms, definitions, or keywords..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(e.target.value)
              }
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium ml-1">Category</label>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredEntries.length}{" "}
          {filteredEntries.length === 1 ? "result" : "results"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredEntries.map((entry) => (
          <div
            key={entry.slug}
            className="glass p-8 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div className="flex-1 prose dark:prose-invert max-w-none">
                <h3 className="text-2xl font-semibold mb-1 mt-0">
                  {entry.term}
                </h3>
                <Badge
                  variant="secondary"
                  onClick={() => handleCategoryClick(entry.category)}
                  className="cursor-pointer mb-4 no-underline"
                >
                  {entry.category}
                </Badge>
                <p className="mt-2 leading-relaxed">{entry.definition}</p>
              </div>
              <div className="flex flex-wrap gap-2 md:w-1/3">
                {entry.keywords.map((keyword) => (
                  <Badge
                    key={keyword}
                    variant={
                      selectedKeyword.toLowerCase() === keyword.toLowerCase()
                        ? "default"
                        : "outline"
                    }
                    onClick={() => handleKeywordClick(keyword)}
                    className="text-sm cursor-pointer transition-colors"
                  >
                    #{keyword}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEntries.length === 0 && (
        <div className="text-center py-12 prose dark:prose-invert mx-auto">
          <p>No matching entries found</p>
        </div>
      )}
    </div>
  );
}
