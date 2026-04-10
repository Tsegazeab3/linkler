import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

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

    const isCountryFilter = filterOptions.length > 0 && (filterOptions.includes('USA') || filterOptions.includes('UK'));

    return (
        <div className="w-full max-w-full mx-auto my-4 space-y-4">
            <div className="relative group">
                <Input
                    type="text"
                    placeholder={placeholder}
                    className="w-full h-14 rounded-2xl border-ui-border bg-ui-white pl-12 pr-4 shadow-sm focus-visible:ring-brand/20 transition-all"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-ui-muted group-focus-within:text-brand transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
                {/* Main Category Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button 
                            variant="ghost" 
                            className={`rounded-full border-none font-black text-[10px] uppercase tracking-widest h-10 px-5 gap-2 transition-all shrink-0 ${activeCategory !== '' ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'bg-ui-white text-ui-text-main hover:bg-ui-bg-alt shadow-sm border border-ui-border'}`}
                        >
                            {activeCategory || (isCountryFilter ? 'Country' : 'Category')}
                            <ChevronDown className="h-3 w-3 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    
                    {/* Full width bottom pane dropdown */}
                    <DropdownMenuContent 
                        align="start"
                        side="bottom"
                        className="w-[100vw] lg:w-[calc(100vw-350px)] mt-2 border-none bg-ui-white/95 backdrop-blur-xl shadow-[0_-20px_50px_rgba(0,0,0,0.1)] rounded-t-[2.5rem] rounded-b-none p-6 pb-12 animate-in slide-in-from-bottom-10 duration-300"
                    >
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between px-2">
                                <h4 className="text-sm font-black uppercase tracking-[0.2em] text-ui-text-main italic">
                                    Select {isCountryFilter ? 'Destination' : 'Category'}
                                </h4>
                                <div className="w-12 h-1 bg-ui-border rounded-full mx-auto" />
                            </div>
                            
                            <div className="flex overflow-x-auto no-scrollbar gap-3 py-2 px-1">
                                <button 
                                    onClick={() => onCategoryChange && onCategoryChange('')}
                                    className={`px-6 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${activeCategory === '' ? 'bg-brand text-white border-brand shadow-md' : 'bg-ui-bg-alt text-ui-text-secondary border-transparent hover:border-ui-border'}`}
                                >
                                    All {isCountryFilter ? 'Countries' : 'Items'}
                                </button>
                                {filterOptions.map(option => (
                                    <button
                                        key={option}
                                        onClick={() => onCategoryChange && onCategoryChange(option)}
                                        className={`px-6 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${activeCategory === option ? 'bg-brand text-white border-brand shadow-md' : 'bg-ui-bg-alt text-ui-text-secondary border-transparent hover:border-ui-border'}`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Additional Quick Filter Chips */}
                <Button variant="ghost" className="rounded-full bg-ui-white border border-ui-border text-ui-text-secondary h-10 w-10 p-0 shrink-0 shadow-sm">
                    <SlidersHorizontal className="h-4 w-4" />
                </Button>
                
                {['Top Rated', 'Available Now', 'Instant Reply', 'Verified'].map(pill => (
                    <button 
                        key={pill}
                        className="px-5 h-10 rounded-full bg-ui-white border border-ui-border text-ui-text-secondary text-[10px] font-bold uppercase tracking-wider whitespace-nowrap hover:bg-ui-bg-alt transition-colors shrink-0 shadow-sm"
                    >
                        {pill}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default FilterComponent;
