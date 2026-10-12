import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CreateResumeButton({ large = false, className }: { large?: boolean; className?: string }) {
  return (
    <Button variant="hero" size={large ? "lg" : "default"} className={className} asChild>
      <Link to="/templates" search={{ next: "builder" }}>
        Create my resume{large && <ArrowRight />}
      </Link>
    </Button>
  );
}
