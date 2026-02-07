import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@shared/routes";
import { useDeposit } from "@/hooks/use-wallet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { UploadCloud, CheckCircle2 } from "lucide-react";
import { useState } from "react";

const formSchema = api.wallet.deposit.input;

export function DepositForm() {
  const { mutate: deposit, isPending } = useDeposit();
  const [fakeUploadProgress, setFakeUploadProgress] = useState(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 50000,
      proofImageUrl: "",
    },
  });

  // Mock file upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate upload
      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        setFakeUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          // Set a fake URL for the backend schema requirement
          form.setValue("proofImageUrl", `https://fake-storage.com/proofs/${Date.now()}-${file.name}`);
        }
      }, 200);
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    deposit(values, {
      onSuccess: () => form.reset(),
    });
  }

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
                  <FormLabel>Deposit Amount (IDR)</FormLabel>
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
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Proof of Transfer</FormLabel>
              <div className="border-2 border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center bg-black/20 hover:bg-black/30 transition-colors cursor-pointer relative">
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={handleFileUpload}
                  accept="image/*"
                />
                {fakeUploadProgress === 100 ? (
                  <div className="text-green-500 flex flex-col items-center">
                    <CheckCircle2 className="w-10 h-10 mb-2" />
                    <span className="font-medium">Image Uploaded</span>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="w-10 h-10 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Click to upload screenshot</span>
                  </>
                )}
              </div>
              {fakeUploadProgress > 0 && fakeUploadProgress < 100 && (
                <div className="h-1 bg-white/10 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-primary transition-all duration-200" style={{ width: `${fakeUploadProgress}%` }} />
                </div>
              )}
              {/* Hidden input to satisfy form validation */}
              <FormField
                control={form.control}
                name="proofImageUrl"
                render={({ field }) => (
                  <FormItem className="hidden">
                     <Input {...field} />
                     <FormMessage />
                  </FormItem>
                )}
              />
            </FormItem>

            <div className="text-xs text-muted-foreground bg-primary/10 p-3 rounded border border-primary/20">
              <p className="font-bold text-primary mb-1">Bank Transfer Info:</p>
              <p>BCA: 85124869641</p>
              <p>Name: RHF ADMIN</p>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-black font-bold h-12 text-lg"
              disabled={isPending}
            >
              {isPending ? "Submitting..." : "Confirm Deposit"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
