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
    activeCategory = '',
    secondaryFilterOptions = [],
    onSecondaryCategoryChange,
    activeSecondaryCategory = '',
    quickFilters = {},
    onQuickFilterToggle,
    showQuickFilters = true,
    value = ''
}) => {
    const [searchTerm, setSearchTerm] = useState(value);
    const debounceTimeout = useRef(null);

    // Sync local state with prop value (e.g. when parent resets search)
    useEffect(() => {
        setSearchTerm(value);
    }, [value]);

    // Helper to handle single selection
    const handleSelectCategory = (option) => {
        if (!onCategoryChange) return;
        
        // If "All" is clicked or the same option is clicked again, reset to empty
        if (option === '' || activeCategory === option) {
            onCategoryChange('');
        } else {
            onCategoryChange(option);
        }
    };

    const handleSelectSecondaryCategory = (option) => {
        if (!onSecondaryCategoryChange) return;
        if (option === '' || activeSecondaryCategory === option) {
            onSecondaryCategoryChange('');
        } else {
            onSecondaryCategoryChange(option);
        }
    };

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
    const isRegionFilter = placeholder.toLowerCase().includes('country') || secondaryFilterOptions.length > 0;
    
    const hasActiveFilter = !!activeCategory;
    const hasSecondaryActiveFilter = !!activeSecondaryCategory;

    return (
        <div className="w-full max-w-full mx-auto my-4 space-y-4">
            <form onSubmit={(e) => e.preventDefault()} className="relative group">
                <Input
                    type="text"
                    placeholder={placeholder}
                    className="w-full h-14 rounded-2xl border-ui-border bg-ui-white pl-12 pr-4 shadow-sm focus-visible:ring-brand/20 transition-all"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    autoComplete="off"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-ui-muted group-focus-within:text-brand transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" />
                    </svg>
                </div>
            </form>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
                {/* Main Category Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button 
                            variant="ghost" 
                            className={`rounded-full border-none font-black text-[10px] uppercase tracking-widest h-10 px-5 gap-2 transition-all shrink-0 ${hasActiveFilter ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'bg-ui-white text-ui-text-main hover:bg-ui-bg-alt shadow-sm border border-ui-border'}`}
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
                                    Select {isRegionFilter ? 'Region' : (isCountryFilter ? 'Destination' : 'Category')}
                                </h4>
                                <div className="w-12 h-1 bg-ui-border rounded-full mx-auto" />
                            </div>
                            
                            <div className="flex overflow-x-auto no-scrollbar gap-3 py-2 px-1">
                                <button 
                                    onClick={() => handleSelectCategory('')}
                                    className={`px-6 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${!hasActiveFilter ? 'bg-brand text-white border-brand shadow-md' : 'bg-ui-bg-alt text-ui-text-secondary border-transparent hover:border-ui-border'}`}
                                >
                                    All {isRegionFilter ? 'Regions' : (isCountryFilter ? 'Countries' : 'Items')}
                                </button>
                                {filterOptions.map(option => (
                                    <button
                                        key={option}
                                        onClick={() => handleSelectCategory(option)}
                                        className={`px-6 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${activeCategory === option ? 'bg-brand text-white border-brand shadow-md' : 'bg-ui-bg-alt text-ui-text-secondary border-transparent hover:border-ui-border'}`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Secondary Category Dropdown (Optional) */}
                {secondaryFilterOptions.length > 0 && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button 
                                variant="ghost" 
                                className={`rounded-full border-none font-black text-[10px] uppercase tracking-widest h-10 px-5 gap-2 transition-all shrink-0 ${hasSecondaryActiveFilter ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'bg-ui-white text-ui-text-main hover:bg-ui-bg-alt shadow-sm border border-ui-border'}`}
                            >
                                {activeSecondaryCategory || 'Region'}
                                <ChevronDown className="h-3 w-3 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        
                        <DropdownMenuContent 
                            align="start"
                            side="bottom"
                            className="w-[100vw] lg:w-[calc(100vw-350px)] mt-2 border-none bg-ui-white/95 backdrop-blur-xl shadow-[0_-20px_50px_rgba(0,0,0,0.1)] rounded-t-[2.5rem] rounded-b-none p-6 pb-12 animate-in slide-in-from-bottom-10 duration-300"
                        >
                            <div className="flex flex-col gap-6">
                                <div className="flex items-center justify-between px-2">
                                    <h4 className="text-sm font-black uppercase tracking-[0.2em] text-ui-text-main italic">
                                        Select Region
                                    </h4>
                                    <div className="w-12 h-1 bg-ui-border rounded-full mx-auto" />
                                </div>
                                
                                <div className="flex overflow-x-auto no-scrollbar gap-3 py-2 px-1">
                                    <button 
                                        type="button"
                                        onClick={() => handleSelectSecondaryCategory('')}
                                        className={`px-6 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${!hasSecondaryActiveFilter ? 'bg-brand text-white border-brand shadow-md' : 'bg-ui-bg-alt text-ui-text-secondary border-transparent hover:border-ui-border'}`}
                                    >
                                        All Regions
                                    </button>
                                    {secondaryFilterOptions.map(option => (
                                        <button
                                            type="button"
                                            key={option}
                                            onClick={() => handleSelectSecondaryCategory(option)}
                                            className={`px-6 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${activeSecondaryCategory === option ? 'bg-brand text-white border-brand shadow-md' : 'bg-ui-bg-alt text-ui-text-secondary border-transparent hover:border-ui-border'}`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}

                {/* Additional Quick Filter Chips */}
                {showQuickFilters && (
                    <>
                        <Button variant="ghost" className="rounded-full bg-ui-white border border-ui-border text-ui-text-secondary h-10 w-10 p-0 shrink-0 shadow-sm">
                            <SlidersHorizontal className="h-4 w-4" />
                        </Button>
                        
                        {['Top Rated', 'Available Now', 'Instant Reply', 'Verified'].map(pill => {
                            const isActive = quickFilters[pill];
                            return (
                                <button 
                                    key={pill}
                                    onClick={() => onQuickFilterToggle && onQuickFilterToggle(pill)}
                                    className={`px-5 h-10 rounded-full border text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all shrink-0 shadow-sm ${
                                        isActive 
                                            ? 'bg-brand text-white border-brand shadow-lg shadow-brand/20' 
                                            : 'bg-ui-white border-ui-border text-ui-text-secondary hover:bg-ui-bg-alt'
                                    }`}
                                >
                                    {pill}
                                </button>
                            );
                        })}
                    </>
                )}
            </div>
        </div>
    );
};

export default FilterComponent;
