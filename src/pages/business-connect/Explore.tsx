import { Link } from "react-router-dom";
import { BCHeader } from "@/components/business-connect/BCHeader";
import { BCFooter } from "@/components/business-connect/BCFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BUSINESS_TYPES } from "@/data/businessTypes";
import { MapPin } from "lucide-react";

const SAMPLE = [
  { name: "Sri Ganesh Pooja Services", type: "priest", city: "Bengaluru", reach: "Statewide" },
  { name: "Divya Astro Consultancy", type: "astrologer", city: "Mysuru", reach: "Nationwide" },
  { name: "Annapoorna Caterers", type: "caterer", city: "Hubli", reach: "District" },
  { name: "Sacred Steps Travels", type: "travel", city: "Tirupati", reach: "Statewide" },
  { name: "Bloom & Beyond Decor", type: "decorator", city: "Bengaluru", reach: "Local" },
  { name: "Nadaswaram Maestros", type: "musician", city: "Chennai", reach: "Statewide" },
];

export default function BCExplore() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <BCHeader />
      <main className="container mx-auto flex-1 px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold md:text-3xl">Explore businesses</h1>
          <p className="text-sm text-muted-foreground">
            A glimpse of the temple-ecosystem businesses on Digidevalaya.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SAMPLE.map((b) => {
            const t = BUSINESS_TYPES.find((x) => x.id === b.type);
            const Icon = t?.icon;
            return (
              <Card key={b.name}>
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                      {Icon && <Icon className="h-5 w-5" />}
                    </span>
                    <div>
                      <div className="font-semibold">{b.name}</div>
                      <div className="text-xs text-muted-foreground">{t?.label}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {b.city} · {b.reach}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className="mt-10 text-center">
          <Button asChild>
            <Link to="/business-connect/auth">Add your business</Link>
          </Button>
        </div>
      </main>
      <BCFooter />
    </div>
  );
}
