import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const FilterComponent = ({ filterOptions = [], placeholder = "Search..." }) => {
    <div className="w-full max-w-full mx-auto my-4 rounded-lg">
      <div className="mb-4">
        <Input
          type="text"
          placeholder={placeholder}
          className="w-full h-12"
        />
      </div>
      <div className="flex overflow-x-auto whitespace-nowrap gap-2 no-scrollbar pb-2">
        {filterOptions.map(option => (
          <Button
            key={option}
            variant="secondary"
            className="rounded-full flex-shrink-0"
          >
            {option}
          </Button>
        ))}
      </div>
    </div>
};

export default FilterComponent;
