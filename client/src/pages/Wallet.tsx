import { DepositForm } from "@/components/wallet/DepositForm";
import { WithdrawForm } from "@/components/wallet/WithdrawForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTransactions } from "@/hooks/use-wallet";
import { useUser } from "@/hooks/use-user";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownLeft, Wallet as WalletIcon } from "lucide-react";

export default function Wallet() {
  const { data: user } = useUser();
  const { data: transactions } = useTransactions();

  return (
    <div className="pb-24 pt-4 px-4 max-w-4xl mx-auto min-h-screen">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <WalletIcon className="text-primary" /> My Wallet
      </h1>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-card to-card/50 border border-white/5 rounded-2xl p-6 mb-8 shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[50px] transition-all duration-500 group-hover:bg-primary/20" />
        <p className="text-muted-foreground text-sm font-medium mb-1">Total Balance</p>
        <h2 className="text-4xl font-mono font-bold text-white tracking-tight">
          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(user?.balance || 0)}
        </h2>
        
        <div className="flex gap-4 mt-6">
          <div className="flex items-center gap-2 text-sm text-green-400">
            <div className="p-1 rounded bg-green-500/10">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            <span>Deposit</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-red-400">
            <div className="p-1 rounded bg-red-500/10">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <span>Withdraw</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="deposit" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-white/5 h-12">
          <TabsTrigger value="deposit" className="text-base">Deposit</TabsTrigger>
          <TabsTrigger value="withdraw" className="text-base">Withdraw</TabsTrigger>
        </TabsList>

        <TabsContent value="deposit">
          <DepositForm />
        </TabsContent>

        <TabsContent value="withdraw">
          <WithdrawForm />
        </TabsContent>
      </Tabs>

      {/* Recent Transactions */}
      <div className="mt-12">
        <h3 className="text-lg font-bold mb-4">Transaction History</h3>
        <div className="bg-card border border-white/5 rounded-xl overflow-hidden">
          {transactions?.slice(0, 5).map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${tx.type === 'deposit' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {tx.type === 'deposit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-medium text-white capitalize">{tx.type}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(tx.createdAt), "MMM d, yyyy HH:mm")}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-white">
                  {tx.type === 'deposit' ? '+' : '-'} Rp {Number(tx.amount).toLocaleString()}
                </p>
                <Badge variant="outline" className={`text-[10px] h-5 ${
                  tx.status === 'approved' ? 'border-green-500 text-green-500' : 
                  tx.status === 'rejected' ? 'border-red-500 text-red-500' : 
                  'border-yellow-500 text-yellow-500'
                }`}>
                  {tx.status}
                </Badge>
              </div>
            </div>
          ))}
          {transactions?.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">No recent transactions</div>
          )}
        </div>
      </div>
    </div>
  );
}
