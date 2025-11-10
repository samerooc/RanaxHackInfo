import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Trash2, Edit, Key, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminPage() {
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<any>(null);

  const { data: keysData, isLoading: keysLoading } = useQuery({
    queryKey: ["/api/admin/keys/detailed"],
  });

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ["/api/admin/search-history"],
  });

  const createKeyMutation = useMutation({
    mutationFn: async (data: { type: string; maxDailySearches?: number; username?: string }) => {
      return apiRequest("POST", "/api/admin/keys/create", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/keys/detailed"] });
      setCreateDialogOpen(false);
      toast({ title: "Key created successfully!" });
    },
  });

  const updateKeyMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      return apiRequest("PUT", `/api/admin/keys/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/keys/detailed"] });
      setEditDialogOpen(false);
      toast({ title: "Key updated successfully!" });
    },
  });

  const deleteKeyMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/keys/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/keys/detailed"] });
      toast({ title: "Key deleted successfully!" });
    },
  });

  const [newKey, setNewKey] = useState({
    type: "limited_daily",
    maxDailySearches: 10,
    username: "",
  });

  const handleCreateKey = () => {
    createKeyMutation.mutate({
      type: newKey.type,
      maxDailySearches: newKey.type === "limited_daily" ? newKey.maxDailySearches : undefined,
      username: newKey.username || undefined,
    });
  };

  const handleEditKey = () => {
    if (selectedKey) {
      updateKeyMutation.mutate({
        id: selectedKey.id,
        maxDailySearches: selectedKey.maxDailySearches,
        username: selectedKey.username,
        isActive: selectedKey.isActive,
      });
    }
  };

  const keys = (keysData as any)?.keys || [];
  const history = (historyData as any)?.history || [];
  
  const limitedKeys = keys.filter((k: any) => k.type === "limited_daily");
  const otherKeys = keys.filter((k: any) => k.type !== "limited_daily");

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage access keys and monitor usage</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-key">
              <Plus className="w-4 h-4 mr-2" />
              Create Key
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="dialog-create-key">
            <DialogHeader>
              <DialogTitle>Create New Access Key</DialogTitle>
              <DialogDescription>Generate a new access key for users</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Key Type</Label>
                <Select value={newKey.type} onValueChange={(v) => setNewKey({ ...newKey, type: v })}>
                  <SelectTrigger data-testid="select-key-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="limited_daily">Limited Daily</SelectItem>
                    <SelectItem value="permanent">Permanent</SelectItem>
                    <SelectItem value="unlimited">Unlimited</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {newKey.type === "limited_daily" && (
                <div>
                  <Label>Max Daily Searches</Label>
                  <Input
                    type="number"
                    value={newKey.maxDailySearches}
                    onChange={(e) => setNewKey({ ...newKey, maxDailySearches: parseInt(e.target.value) })}
                    data-testid="input-max-searches"
                  />
                </div>
              )}
              
              <div>
                <Label>Username (Optional)</Label>
                <Input
                  value={newKey.username}
                  onChange={(e) => setNewKey({ ...newKey, username: e.target.value })}
                  placeholder="Enter username"
                  data-testid="input-username"
                />
              </div>
              
              <Button onClick={handleCreateKey} className="w-full" disabled={createKeyMutation.isPending} data-testid="button-submit-create">
                {createKeyMutation.isPending ? "Creating..." : "Create Key"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="keys" className="space-y-4">
        <TabsList data-testid="tabs-admin">
          <TabsTrigger value="keys" data-testid="tab-keys">
            <Key className="w-4 h-4 mr-2" />
            Access Keys
          </TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">
            <History className="w-4 h-4 mr-2" />
            Search History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Total Keys</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="text-total-keys">{keys.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Limited Keys</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="text-limited-keys">{limitedKeys.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Active Keys</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="text-active-keys">{keys.filter((k: any) => k.isActive).length}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Access Keys</CardTitle>
              <CardDescription>Manage all access keys in the system</CardDescription>
            </CardHeader>
            <CardContent>
              {keysLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Key</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Daily Limit</TableHead>
                        <TableHead>Today Usage</TableHead>
                        <TableHead>Remaining</TableHead>
                        <TableHead>Total Searches</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {keys.map((key: any) => (
                        <TableRow key={key.id} data-testid={`row-key-${key.id}`}>
                          <TableCell className="font-mono text-xs" data-testid={`text-key-${key.id}`}>{key.key}</TableCell>
                          <TableCell>
                            <Badge variant={key.type === "unlimited" ? "default" : key.type === "permanent" ? "secondary" : "outline"}>
                              {key.type}
                            </Badge>
                          </TableCell>
                          <TableCell data-testid={`text-username-${key.id}`}>{key.username || "-"}</TableCell>
                          <TableCell data-testid={`text-limit-${key.id}`}>{key.maxDailySearches || "∞"}</TableCell>
                          <TableCell data-testid={`text-usage-${key.id}`}>{key.todayUsage}</TableCell>
                          <TableCell data-testid={`text-remaining-${key.id}`}>
                            {key.remaining !== null ? (
                              <span className={key.remaining <= 2 ? "text-destructive font-bold" : ""}>
                                {key.remaining}
                              </span>
                            ) : "∞"}
                          </TableCell>
                          <TableCell data-testid={`text-total-${key.id}`}>{key.totalSearches}</TableCell>
                          <TableCell>
                            <Badge variant={key.isActive ? "default" : "outline"}>
                              {key.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedKey(key);
                                  setEditDialogOpen(true);
                                }}
                                data-testid={`button-edit-${key.id}`}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => deleteKeyMutation.mutate(key.id)}
                                data-testid={`button-delete-${key.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Search History</CardTitle>
              <CardDescription>View all searches performed by users</CardDescription>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Key</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Search Type</TableHead>
                        <TableHead>Query</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history.map((h: any) => (
                        <TableRow key={h.id} data-testid={`row-history-${h.id}`}>
                          <TableCell data-testid={`text-timestamp-${h.id}`}>
                            {new Date(h.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell data-testid={`text-hist-username-${h.id}`}>{h.username || "-"}</TableCell>
                          <TableCell className="font-mono text-xs">{h.keyValue?.substring(0, 10)}...</TableCell>
                          <TableCell>
                            <Badge variant="outline">{h.keyType}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge>{h.searchType}</Badge>
                          </TableCell>
                          <TableCell className="font-mono" data-testid={`text-query-${h.id}`}>{h.searchQuery}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Key Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent data-testid="dialog-edit-key">
          <DialogHeader>
            <DialogTitle>Edit Access Key</DialogTitle>
            <DialogDescription>Update key settings</DialogDescription>
          </DialogHeader>
          {selectedKey && (
            <div className="space-y-4">
              <div>
                <Label>Key</Label>
                <Input value={selectedKey.key} disabled className="font-mono" />
              </div>
              
              <div>
                <Label>Username</Label>
                <Input
                  value={selectedKey.username || ""}
                  onChange={(e) => setSelectedKey({ ...selectedKey, username: e.target.value })}
                  placeholder="Enter username"
                  data-testid="input-edit-username"
                />
              </div>
              
              {selectedKey.type === "limited_daily" && (
                <div>
                  <Label>Max Daily Searches</Label>
                  <Input
                    type="number"
                    value={selectedKey.maxDailySearches}
                    onChange={(e) => setSelectedKey({ ...selectedKey, maxDailySearches: parseInt(e.target.value) })}
                    data-testid="input-edit-searches"
                  />
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Label>Active</Label>
                <Select
                  value={selectedKey.isActive ? "true" : "false"}
                  onValueChange={(v) => setSelectedKey({ ...selectedKey, isActive: v === "true" })}
                >
                  <SelectTrigger data-testid="select-edit-active">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={handleEditKey} className="w-full" disabled={updateKeyMutation.isPending} data-testid="button-submit-edit">
                {updateKeyMutation.isPending ? "Updating..." : "Update Key"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
