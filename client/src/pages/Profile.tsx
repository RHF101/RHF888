import { useUser, useUpdateBankDetails } from "@/hooks/use-user";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useForm } from "react-hook-form";
import { User, LogOut, Save } from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { data: user } = useUser();
  const { logout } = useAuth();
  const { mutate: updateBank, isPending } = useUpdateBankDetails();
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      bankName: "",
      bankAccountNumber: "",
      bankAccountName: "",
    }
  });

  useEffect(() => {
    if (user?.bankDetails) {
      form.reset({
        bankName: user.bankDetails.bankName || "",
        bankAccountNumber: user.bankDetails.accountNumber || "",
        bankAccountName: user.bankDetails.accountName || "",
      });
    }
  }, [user, form]);

  const onSubmit = (data: any) => {
    updateBank(data, {
      onSuccess: () => {
        toast({ title: "Profile Updated", description: "Bank details saved." });
      },
      onError: (err) => {
        toast({ title: "Update Failed", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-2xl mx-auto min-h-screen">
      <div className="flex flex-col items-center mb-8">
        <Avatar className="w-24 h-24 mb-4 border-2 border-primary ring-4 ring-primary/20">
          <AvatarImage src={user?.profileImageUrl || ''} />
          <AvatarFallback className="bg-primary text-black text-2xl font-bold">
            {user?.firstName?.[0]}
          </AvatarFallback>
        </Avatar>
        <h1 className="text-2xl font-bold text-white">{user?.firstName} {user?.lastName}</h1>
        <p className="text-muted-foreground text-sm">{user?.email}</p>
        {user?.isAdmin && (
          <span className="mt-2 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
            ADMINISTRATOR
          </span>
        )}
      </div>

      <Card className="bg-card/50 border-white/5 mb-8">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5 text-primary" /> Bank Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Bank Name</Label>
              <Input 
                {...form.register("bankName")} 
                placeholder="e.g. BCA, Mandiri"
                className="bg-black/20"
              />
            </div>
            <div className="space-y-2">
              <Label>Account Number</Label>
              <Input 
                {...form.register("bankAccountNumber")} 
                className="bg-black/20"
              />
            </div>
            <div className="space-y-2">
              <Label>Account Holder Name</Label>
              <Input 
                {...form.register("bankAccountName")} 
                className="bg-black/20"
              />
            </div>
            <Button type="submit" disabled={isPending} className="w-full bg-primary text-black font-bold">
              <Save className="w-4 h-4 mr-2" /> Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      <Button variant="destructive" className="w-full" onClick={() => logout()}>
        <LogOut className="w-4 h-4 mr-2" /> Logout
      </Button>
    </div>
  );
}
