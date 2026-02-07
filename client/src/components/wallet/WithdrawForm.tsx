import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@shared/routes";
import { useWithdraw } from "@/hooks/use-wallet";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

const formSchema = api.wallet.withdraw.input;

export function WithdrawForm() {
  const { mutate: withdraw, isPending } = useWithdraw();
  const { data: user } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 50000,
      destinationAccount: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    withdraw(values, {
      onSuccess: () => form.reset(),
    });
  }

  // Auto-fill bank details if saved
  const savedBankInfo = user?.bankDetails?.bankAccountNumber 
    ? `${user.bankDetails.bankName} - ${user.bankDetails.bankAccountNumber} (${user.bankDetails.accountName})`
    : "";

  return (
    <Card className="bg-card/50 border-white/5">
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Withdraw Amount (IDR)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span>
                      <Input 
                        type="number" 
                        className="pl-10 bg-black/20 border-white/10 h-12 text-lg" 
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                  <div className="text-xs text-muted-foreground flex justify-between">
                    <span>Min: Rp 50,000</span>
                    <span>Max: Rp {user?.balance?.toLocaleString()}</span>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="destinationAccount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination Account</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Bank Name - Number - Owner Name" 
                      className="bg-black/20 border-white/10 h-12" 
                      {...field}
                      defaultValue={savedBankInfo || field.value}
                    />
                  </FormControl>
                  <FormMessage />
                  {savedBankInfo && (
                    <Button 
                      type="button" 
                      variant="link" 
                      className="h-auto p-0 text-primary text-xs"
                      onClick={() => form.setValue("destinationAccount", savedBankInfo)}
                    >
                      Use saved bank: {savedBankInfo}
                    </Button>
                  )}
                </FormItem>
              )}
            />

            {!user?.bankDetails?.bankAccountNumber && (
              <div className="flex items-center gap-2 p-3 rounded bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Please update your bank details in Profile for faster withdrawals.</span>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-black font-bold h-12 text-lg"
              disabled={isPending}
            >
              {isPending ? "Processing..." : "Request Withdraw"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
