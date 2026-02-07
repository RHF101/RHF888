import { useAdminUsers, useAdminUpdateUser } from "@/hooks/use-admin";
import { TransactionsTable } from "@/components/admin/TransactionsTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Search } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="p-6 max-w-[1600px] mx-auto min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display font-bold text-white">Admin Dashboard</h1>
      </div>

      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionsTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <UsersTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function UsersTable() {
  const { data: users, isLoading } = useAdminUsers();
  const { mutate: updateUser } = useAdminUpdateUser();
  const [search, setSearch] = useState("");

  const filteredUsers = users?.filter((u: any) => 
    u.id.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <div>Loading users...</div>;

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search by ID or Email" 
          value={search} 
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-black/20"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-white/5 hover:bg-white/5">
            <TableHead>User</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead>Win Rate (%)</TableHead>
            <TableHead>Frozen</TableHead>
            <TableHead>Admin</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers?.map((user: any) => (
            <TableRow key={user.id} className="border-white/5 hover:bg-white/5">
              <TableCell>
                <div>
                  <div className="font-bold">{user.firstName} {user.lastName}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                  <div className="text-[10px] font-mono text-muted-foreground">{user.id}</div>
                </div>
              </TableCell>
              <TableCell className="font-mono text-primary">
                Rp {Number(user.balance).toLocaleString()}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    defaultValue={user.winRate} 
                    className="w-16 h-8 bg-black/20"
                    onBlur={(e) => {
                      const val = Number(e.target.value);
                      if (val !== user.winRate) {
                        updateUser({ userId: user.id, updates: { winRate: val } });
                      }
                    }}
                  />
                </div>
              </TableCell>
              <TableCell>
                <Switch 
                  checked={user.isFrozen}
                  onCheckedChange={(checked) => 
                    updateUser({ userId: user.id, updates: { isFrozen: checked } })
                  }
                />
              </TableCell>
              <TableCell>
                <Switch 
                  checked={user.isAdmin}
                  onCheckedChange={(checked) => 
                    updateUser({ userId: user.id, updates: { isAdmin: checked } })
                  }
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
