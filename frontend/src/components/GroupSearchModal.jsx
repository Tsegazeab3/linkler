import React, { useState, useEffect, useRef } from 'react';
import { searchGroups, requestToJoinGroup, joinGroupByInvite } from '../services/api';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Search, Users, Globe, Lock, Check } from "lucide-react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

const GroupSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [joiningInvite, setJoiningInvite] = useState(false);
  const debounceTimeout = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    setLoading(true);
    debounceTimeout.current = setTimeout(() => {
      searchGroups(query)
        .then(res => setResults(res.data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }, 400);

    return () => clearTimeout(debounceTimeout.current);
  }, [query]);

  const handleRequestJoin = async (groupId) => {
    try {
      await requestToJoinGroup(groupId);
      toast.success("Join request sent!", {
          description: "An administrator will review your request."
      });
      // Optionally update local UI state
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to send request");
    }
  };

  const handleJoinByInvite = async () => {
    if (!inviteCode.trim()) return;
    setJoiningInvite(true);
    try {
      const res = await joinGroupByInvite(inviteCode);
      toast.success(`Joined ${res.data.name}!`);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Invalid invite code");
    } finally {
      setJoiningInvite(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none bg-ui-white shadow-2xl">
        <VisuallyHidden.Root>
            <DialogTitle>Discover Groups</DialogTitle>
            <DialogDescription>Search for public groups or join via invite code.</DialogDescription>
        </VisuallyHidden.Root>

        <div className="p-6 pb-4 border-b border-ui-border">
          <h2 className="text-2xl font-black text-ui-text-main italic mb-4">Discover Groups</h2>
          
          <div className="space-y-4">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ui-muted" />
                <Input
                  placeholder="Search public groups..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10 bg-ui-bg-alt border-none h-11 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2">
                  <Input 
                    placeholder="Enter invite code..."
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    className="bg-ui-bg-alt border-none h-11 rounded-xl font-mono uppercase tracking-widest"
                  />
                  <Button onClick={handleJoinByInvite} disabled={joiningInvite || !inviteCode.trim()} className="h-11 rounded-xl font-bold">
                      Join
                  </Button>
              </div>
          </div>
        </div>

        <div className="p-6 pt-4 max-h-[60vh] overflow-y-auto no-scrollbar">
            {loading ? (
                <div className="flex flex-col items-center justify-center py-8 opacity-50">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
                </div>
            ) : results.length > 0 ? (
                <div className="space-y-3">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-ui-muted mb-2">Search Results</h3>
                    {results.map(group => (
                        <div key={group.id} className="flex items-center justify-between p-3 rounded-2xl bg-ui-bg-alt/50 border border-ui-border hover:bg-ui-bg-alt transition-all">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12 rounded-2xl border border-ui-border">
                                    <AvatarImage src={group.avatar} />
                                    <AvatarFallback className="rounded-2xl bg-brand-light text-brand font-bold">
                                        {group.name?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-bold text-ui-text-main">{group.name}</p>
                                    <p className="text-[10px] text-ui-muted flex items-center gap-1">
                                        <Users className="h-3 w-3" /> {group.members?.length || 0} members
                                    </p>
                                </div>
                            </div>
                            <Button size="sm" onClick={() => handleRequestJoin(group.id)} className="rounded-xl font-bold text-xs">
                                Request to Join
                            </Button>
                        </div>
                    ))}
                </div>
            ) : query && (
                <div className="text-center py-8 opacity-50">
                    <p className="text-sm font-medium text-ui-muted">No public groups found matching "{query}"</p>
                </div>
            )}

            {!query && !loading && (
                <div className="flex flex-col items-center justify-center py-8 text-ui-muted opacity-50">
                    <Globe className="h-10 w-10 mb-2 stroke-[1.5]" />
                    <p className="text-xs font-medium text-center max-w-[200px]">Search for public interest groups or enter a private invite code.</p>
                </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupSearchModal;
