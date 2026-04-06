import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const FilterComponent = ({ 
    filterOptions = [], 
    placeholder = "Search...", 
    onSearchChange, 
    onCategoryChange,
    activeCategory = ''
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const debounceTimeout = useRef(null);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
        
        debounceTimeout.current = setTimeout(() => {
            if (onSearchChange) onSearchChange(value);
        }, 500);
    };

    return (
        <div className="w-full max-w-full mx-auto my-4 rounded-lg">
            <div className="mb-4">
                <Input
                    type="text"
                    placeholder={placeholder}
                    className="w-full h-12"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
            </div>
            <div className="flex overflow-x-auto whitespace-nowrap gap-2 no-scrollbar pb-2">
                <Button
                    variant={activeCategory === '' ? "default" : "secondary"}
                    className="rounded-full flex-shrink-0"
                    onClick={() => onCategoryChange && onCategoryChange('')}
                >
                    All
                </Button>
                {filterOptions.map(option => (
                    <Button
                        key={option}
                        variant={activeCategory === option ? "default" : "secondary"}
                        className="rounded-full flex-shrink-0"
                        onClick={() => onCategoryChange && onCategoryChange(option)}
                    >
                        {option}
                    </Button>
                ))}
            </div>
        </div>
    );
};

export default FilterComponent;
