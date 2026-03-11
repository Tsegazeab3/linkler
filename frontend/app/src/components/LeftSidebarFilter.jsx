import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const LeftSidebarFilter = () => {
  const languages = ['English', 'Spanish', 'French', 'German'];
  const countries = ['USA', 'Spain', 'France', 'Germany'];
  const services = ['Travel', 'Housing', 'Documentation'];

  return (
    <Card className="rounded-xl shadow-sm border-border/50">
      <CardHeader className="pb-3 border-b border-border/50 mb-4">
        <CardTitle className="text-lg font-bold">Filter By</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Filter */}
        <div className="space-y-2">
          <Label htmlFor="price" className="text-sm font-semibold">Max Price</Label>
          <input type="range" id="price" name="price" min="0" max="500" className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary" />
        </div>

        {/* Language Filter */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Language</h4>
          <div className="space-y-2">
            {languages.map(lang => (
              <div key={lang} className="flex items-center space-x-2">
                <input type="checkbox" id={lang} name={lang} className="h-4 w-4 rounded border-input text-primary focus:ring-primary" />
                <Label htmlFor={lang} className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{lang}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Country Filter */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Country</h4>
          <div className="space-y-2">
            {countries.map(country => (
              <div key={country} className="flex items-center space-x-2">
                <input type="checkbox" id={country} name={country} className="h-4 w-4 rounded border-input text-primary focus:ring-primary" />
                <Label htmlFor={country} className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{country}</Label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Services Filter */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Services</h4>
          <div className="space-y-2">
            {services.map(service => (
              <div key={service} className="flex items-center space-x-2">
                <input type="checkbox" id={service} name={service} className="h-4 w-4 rounded border-input text-primary focus:ring-primary" />
                <Label htmlFor={service} className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{service}</Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeftSidebarFilter;
