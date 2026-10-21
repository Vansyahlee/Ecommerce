import { Button } from "~/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-8 p-4">
      <h1 className="text-5xl font-extrabold tracking-tight text-foreground">
        Adilin Indonesia
      </h1>
      
      <div className="flex flex-row flex-wrap gap-4 items-center justify-center">
        <Button variant="default">Click Me</Button>
        <Button variant="secondary">Click Me</Button>
        <Button variant="outline">Click Me</Button>
        <Button variant="ghost">Click Me</Button>
        <Button variant="destructive">Click Me</Button>
        <Button variant="link">Click Me</Button>
      </div>
    </div>
  );
}