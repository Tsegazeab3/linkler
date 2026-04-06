import React, { useState, useEffect, useRef } from 'react';
import { searchUsers, createGroup } from '../services/api';
import { Dialog, DialogContent, DialogTitle, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { X, Search, Users, Plus, Check } from "lucide-react";

const CreateGroupModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: Select Members, 2: Group Info
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const debounceTimeout = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setGroupName('');
      setSearchQuery('');
      setSearchResults([]);
      setSelectedMembers([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    setLoading(true);
    debounceTimeout.current = setTimeout(() => {
      searchUsers(searchQuery)
        .then(res => {
          setSearchResults(res.data);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }, 400);

    return () => clearTimeout(debounceTimeout.current);
  }, [searchQuery]);

  const toggleMember = (user) => {
    if (selectedMembers.find(m => m.id === user.id)) {
      setSelectedMembers(selectedMembers.filter(m => m.id !== user.id));
    } else {
      setSelectedMembers([...selectedMembers, user]);
    }
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }
    if (selectedMembers.length === 0) {
      toast.error("Please select at least one member");
      return;
    }

    setSubmitting(true);
    try {
      const memberIds = selectedMembers.map(m => m.id);
      const res = await createGroup(groupName, memberIds);
      toast.success("Group created successfully!");
      if (onSuccess) onSuccess(res.data);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create group");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none bg-ui-white shadow-2xl">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-black text-ui-text-main italic">
            {step === 1 ? 'New Group' : 'Group Details'}
          </DialogTitle>
          <p className="text-xs text-ui-muted font-medium uppercase tracking-widest mt-1">
            {step === 1 ? `Select Members (${selectedMembers.length})` : 'Set name and icon'}
          </p>
        </DialogHeader>

        <div className="p-6 pt-4">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ui-muted" />
                <Input
                  placeholder="Search travelers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-ui-bg-alt border-none h-11 rounded-xl"
                />
              </div>

              {selectedMembers.length > 0 && (
                <div className="flex flex-wrap gap-2 py-2 border-b border-ui-border">
                  {selectedMembers.map(member => (
                    <div key={member.id} className="bg-brand/10 text-brand text-[10px] font-bold py-1 px-3 rounded-full flex items-center gap-1.5 animate-in zoom-in-95">
                      {member.username}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => toggleMember(member)} />
                    </div>
                  ))}
                </div>
              )}

              <div className="max-h-60 overflow-y-auto pr-2 no-scrollbar space-y-1">
                {searchResults.map(user => {
                  const isSelected = selectedMembers.find(m => m.id === user.id);
                  return (
                    <div 
                      key={user.id} 
                      onClick={() => toggleMember(user)}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-ui-bg-alt cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-ui-border">
                          <AvatarImage src={user.profile_picture} className="object-cover" />
                          <AvatarFallback>{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-bold text-ui-text-main">{user.username}</p>
                          <p className="text-[10px] text-ui-muted truncate max-w-[150px]">{user.bio || 'New traveler'}</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-brand border-brand text-white' : 'border-ui-border'}`}>
                        {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
                {searchQuery && !loading && searchResults.length === 0 && (
                  <p className="text-center py-4 text-sm text-ui-muted">No users found</p>
                )}
                {!searchQuery && (
                   <div className="flex flex-col items-center justify-center py-8 text-ui-muted opacity-50">
                     <Users className="h-10 w-10 mb-2 stroke-[1.5]" />
                     <p className="text-xs font-medium">Search for friends to add</p>
                   </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-3xl bg-ui-bg-alt border-2 border-dashed border-ui-border flex flex-col items-center justify-center text-ui-muted cursor-pointer hover:bg-ui-bg hover:text-brand transition-all">
                  <Plus className="h-8 w-8 mb-1" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Add Icon</span>
                </div>
                
                <div className="w-full space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-ui-muted ml-1">Group Name</Label>
                  <Input
                    placeholder="E.g., Summer Trip 2024"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="h-12 text-lg font-bold border-ui-border rounded-xl focus-visible:ring-brand"
                    autoFocus
                  />
                </div>
              </div>

              <div className="bg-ui-bg-alt/50 p-4 rounded-2xl border border-ui-border">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-ui-muted mb-3">Members ({selectedMembers.length + 1})</h4>
                <div className="flex flex-wrap gap-2">
                  <div className="bg-ui-white border border-ui-border p-1.5 pr-3 rounded-full flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-brand text-white text-[10px] flex items-center justify-center font-bold">You</div>
                    <span className="text-[10px] font-bold text-ui-text-main italic">Administrator</span>
                  </div>
                  {selectedMembers.map(m => (
                    <div key={m.id} className="bg-ui-white border border-ui-border p-1.5 pr-3 rounded-full flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={m.profile_picture} />
                        <AvatarFallback className="text-[8px]">{m.username?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-[10px] font-bold text-ui-text-secondary">{m.username}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 bg-ui-bg-alt/30 border-t border-ui-border">
          {step === 1 ? (
            <Button 
              className="w-full h-12 rounded-xl font-bold text-base shadow-lg shadow-brand/20 transition-all active:scale-95"
              disabled={selectedMembers.length === 0}
              onClick={() => setStep(2)}
            >
              Next Step
              <Plus className="ml-2 h-5 w-5" />
            </Button>
          ) : (
            <div className="flex gap-3 w-full">
              <Button 
                variant="outline" 
                className="flex-1 h-12 rounded-xl font-bold"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button 
                className="flex-[2] h-12 rounded-xl font-bold text-base shadow-lg shadow-brand/20 transition-all active:scale-95"
                disabled={submitting || !groupName.trim()}
                onClick={handleCreate}
              >
                {submitting ? 'Creating...' : 'Create Group'}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupModal;

// Minimal Label component if shadcn isn't available
const Label = ({ children, className }) => (
  <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}>
    {children}
  </label>
);
