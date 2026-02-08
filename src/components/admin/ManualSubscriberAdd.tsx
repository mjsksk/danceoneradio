import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserPlus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .email("Please enter a valid email address")
  .max(255, "Email must be less than 255 characters");

const ManualSubscriberAdd = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    const validEmail = result.data;
    setLoading(true);

    try {
      // Check if already exists
      const { data: existing } = await supabase
        .from("newsletter_subscribers")
        .select("id, is_active")
        .eq("email", validEmail)
        .maybeSingle();

      if (existing?.is_active) {
        toast.info("This email is already subscribed.");
        setLoading(false);
        return;
      }

      if (existing && !existing.is_active) {
        // Reactivate
        const { error } = await supabase
          .from("newsletter_subscribers")
          .update({ is_active: true, subscribed_at: new Date().toISOString() })
          .eq("id", existing.id);

        if (error) throw error;
        toast.success("Subscriber reactivated successfully!");
      } else {
        // Insert new
        const { error } = await supabase
          .from("newsletter_subscribers")
          .insert({ email: validEmail, country: "Manual" });

        if (error) throw error;
        toast.success("Subscriber added successfully!");
      }

      setEmail("");
    } catch (err: any) {
      console.error("Error adding subscriber:", err);
      toast.error("Failed to add subscriber. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
      <h2 className="text-2xl font-['Orbitron'] font-bold mb-4 text-neon-purple flex items-center gap-2">
        <UserPlus className="w-6 h-6" />
        Add Subscriber Manually
      </h2>
      <p className="text-sm text-muted-foreground font-['Rajdhani'] mb-4">
        Manually add an email address to the newsletter subscriber list.
      </p>
      <div className="flex gap-3">
        <Input
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && handleAdd()}
          className="flex-1"
          disabled={loading}
        />
        <Button onClick={handleAdd} disabled={loading || !email.trim()}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
          Add
        </Button>
      </div>
    </Card>
  );
};

export default ManualSubscriberAdd;
