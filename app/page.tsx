"use client"
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";


interface ApiResponse {
  is_success: boolean;
  user_id: string;
  email: string;
  roll_number: string;
  numbers: string[];
  alphabets: string[];
  highest_lowercase_alphabet: string[];
  [key: string]: any;
}

export default function Home() {
  const [jsonInput, setJsonInput] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const validateAndSubmit = async () => {
    try {
      const parsedJson = JSON.parse(jsonInput);
      
      if (!parsedJson.data || !Array.isArray(parsedJson.data)) {
        throw new Error('Input must contain a "data" array');
      }

      const response = await fetch('/api/bfhl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonInput,
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      setApiResponse(data.response);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON format');
      setApiResponse(null);
    }
  };

  const getFilteredResponse = () => {
    if (!apiResponse) return null;

    const result: { [key: string]: any } = {};

    selectedFilters.forEach(filter => {
      switch (filter) {
        case 'numbers':
          result.numbers = apiResponse.numbers;
          break;
        case 'alphabets':
          result.alphabets = apiResponse.alphabets;
          break;
        case 'highest_lowercase':
          result.highest_lowercase_alphabet = apiResponse.highest_lowercase_alphabet;
          break;
      }
    });

    return result;
  };

  const renderResponse = () => {
    const filteredResponse = getFilteredResponse();
    if (!filteredResponse) return null;

    return Object.entries(filteredResponse).map(([key, value]) => (
      <div key={key} className="mb-4">
        <Label className="font-bold capitalize">{key.replace(/_/g, ' ')}:</Label>
        <div className="mt-1">{Array.isArray(value) ? value.join(', ') : value}</div>
      </div>
    ));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="space-y-6">
        <div className="space-y-4">
          <Label htmlFor="jsonInput">API Input</Label>
          <Input
            id="jsonInput"
            placeholder='{ "data": ["A","C","z"] }'
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
          />
          <Button onClick={validateAndSubmit} className="w-full">
            Submit
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {apiResponse && (
          <div className="space-y-4">
            <Label>Multi Filter</Label>
            <Select
              onValueChange={(value) => {
                if (selectedFilters.includes(value)) {
                  setSelectedFilters(selectedFilters.filter(f => f !== value));
                } else {
                  setSelectedFilters([...selectedFilters, value]);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select filters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="numbers">Numbers</SelectItem>
                <SelectItem value="alphabets">Alphabets</SelectItem>
                <SelectItem value="highest_lowercase">Highest Lowercase Alphabet</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {selectedFilters.length > 0 && (
          <div className="mt-6 p-4 border rounded-lg">
            <h2 className="text-lg font-bold mb-4">Filtered Response</h2>
            {renderResponse()}
          </div>
        )}
      </div>
    </div>
  );
  // );
}
