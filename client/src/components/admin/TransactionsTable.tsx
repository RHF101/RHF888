import { useAdminTransactions, useProcessTransaction } from "@/hooks/use-admin";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export function TransactionsTable() {
  const { data: transactions, isLoading } = useAdminTransactions();
  const { mutate: process, isPending } = useProcessTransaction();
  const [selectedProof, setSelectedProof] = useState<string | null>(null);

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading transactions...</div>;

  return (
    <div className="bg-card border border-white/5 rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-white/5 hover:bg-white/5">
            <TableHead>Date</TableHead>
            <TableHead>User ID</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Proof/Dest</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions?.map((tx) => (
            <TableRow key={tx.id} className="border-white/5 hover:bg-white/5">
              <TableCell className="font-mono text-xs text-muted-foreground">
                {format(new Date(tx.createdAt), "MMM d, HH:mm")}
              </TableCell>
              <TableCell className="font-mono text-xs">{tx.userId.slice(0, 8)}...</TableCell>
              <TableCell>
                <Badge variant={tx.type === 'deposit' ? 'default' : 'secondary'} className={tx.type === 'deposit' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}>
                  {tx.type.toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell className="font-bold">
                Rp {Number(tx.amount).toLocaleString()}
              </TableCell>
              <TableCell>
                {tx.type === 'deposit' ? (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 text-xs text-blue-400">
                        View Proof <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <img src={tx.proofImageUrl || ''} alt="Proof" className="w-full rounded-lg" />
                    </DialogContent>
                  </Dialog>
                ) : (
                  <span className="text-xs truncate max-w-[150px] block" title={tx.destinationAccount || ''}>
                    {tx.destinationAccount}
                  </span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={
                  tx.status === 'approved' ? 'border-green-500 text-green-500' :
                  tx.status === 'rejected' ? 'border-red-500 text-red-500' :
                  'border-yellow-500 text-yellow-500'
                }>
                  {tx.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {tx.status === 'pending' && (
                  <div className="flex justify-end gap-2">
                    <Button 
                      size="icon" 
                      className="h-8 w-8 bg-green-500 hover:bg-green-600"
                      onClick={() => process({ id: tx.id, data: { status: 'approved' } })}
                      disabled={isPending}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      className="h-8 w-8 bg-red-500 hover:bg-red-600"
                      onClick={() => process({ id: tx.id, data: { status: 'rejected' } })}
                      disabled={isPending}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
          {transactions?.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No transactions found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
