import { Card, CardHeader, CardTitle, CardDescription } from "./card";

export function HeroSkeleton() {
  return (
    <Card className="mb-8">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">
          <div className="h-8 bg-gray-200 rounded animate-pulse mx-auto w-3/4"></div>
        </CardTitle>
        <CardDescription className="mt-4 max-w-2xl mx-auto text-base">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6 mt-2"></div>
        </CardDescription>
      </CardHeader>
    </Card>
  );
}